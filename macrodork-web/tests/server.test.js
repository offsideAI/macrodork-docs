import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { readConfig } from "../server/config.js";
import { openStore } from "../server/store.js";
import { createApp } from "../server/app.js";

const env = {
  PREORDERS_ENABLED: "true",
  STRIPE_SECRET_KEY: "sk_test_fixture",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture",
  STRIPE_PRICE_ID: "price_fixture",
  PUBLIC_ORIGIN: "http://localhost:5173",
  PREORDER_CURRENCY: "cad",
  PREORDER_MODE: "deposit",
  PREORDER_TERMS_VERSION: "test-v1",
  PREORDER_TERMS: "Fixture only: prototype deposit.",
  PREORDER_REFUND_POLICY: "Fixture only: refundable.",
  PREORDER_DELIVERY_ESTIMATE: "Fixture only: no shipment date.",
  PREORDER_BALANCE_STATEMENT: "Fixture only: balance TBD.",
  MERCHANT_NAME: "Test merchant",
  SUPPORT_EMAIL: "test@example.com",
  PREORDER_PRIVACY_NOTICE: "Fixture only: retain order record.",
  PREORDER_COUNTRIES: "CA",
};
async function fixture(t, overrides = {}) {
  const store = openStore(":memory:");
  const config = readConfig({ ...env, ...overrides });
  const calls = [];
  const stripe = {
    prices: {
      retrieve: async () => ({
        active: true,
        type: "one_time",
        currency: "cad",
        unit_amount: 10000,
        livemode: false,
      }),
    },
    checkout: {
      sessions: {
        create: async (params, options) => {
          calls.push({ params, options });
          return {
            id: `cs_test_${params.client_reference_id.replaceAll("-", "")}`,
            url: "https://checkout.stripe.com/c/pay/cs_test_fixture",
          };
        },
      },
    },
    webhooks: new Stripe("sk_test_fixture").webhooks,
  };
  const app = createApp({ config, stripe, store, logger: { error() {} } });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(async () => {
    await new Promise((r) => server.close(r));
    store.close();
  });
  const url = () => `http://127.0.0.1:${server.address().port}`;
  const send = async (path, body, origin = config.origin) =>
    fetch(`${url()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body),
    });
  const create = async (id = randomUUID()) => {
    const response = await send("/api/checkout", {
      requestId: id,
      accepted: true,
      termsVersion: config.termsVersion,
    });
    return { response, id, row: store.getRequest(id) };
  };
  const webhook = async (event) => {
    const body = JSON.stringify(event);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret: config.webhookSecret,
    });
    return fetch(`${url()}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": signature,
      },
      body,
    });
  };
  const event = (
    row,
    type = "checkout.session.completed",
    payment_status = "paid",
    extra = {},
  ) => ({
    id: `evt_${randomUUID()}`,
    type,
    data: {
      object: {
        id: row.session_id,
        mode: "payment",
        livemode: false,
        currency: "cad",
        amount_total: 10000,
        metadata: {
          product: "mark-1",
          request_id: row.request_id,
          terms_version: "test-v1",
        },
        payment_status,
        payment_intent: "pi_fixture",
        customer_details: { email: "buyer@example.com" },
        ...extra,
      },
    },
  });
  return { store, stripe, calls, url, send, create, webhook, event, config };
}
test("configuration closes checkout by default and rejects incomplete or unsafe live setup", () => {
  assert.equal(readConfig({}).ready, false);
  assert.equal(readConfig(env).ready, true);
  assert.equal(
    readConfig({ ...env, STRIPE_SECRET_KEY: "sk_live_fixture" }).ready,
    false,
  );
  assert.equal(readConfig({ ...env, PREORDER_REFUND_POLICY: "" }).ready, false);
  assert.equal(readConfig({ ...env, NODE_ENV: "production" }).ready, false);
  assert.equal(
    readConfig({ ...env, PUBLIC_ORIGIN: "https://site.example/path" }).ready,
    false,
  );
});
test("closed preorders expose no secrets and cannot create payments", async (t) => {
  const f = await fixture(t, { PREORDERS_ENABLED: "false" });
  assert.deepEqual(await (await fetch(`${f.url()}/api/preorder`)).json(), {
    enabled: false,
  });
  assert.equal((await f.create()).response.status, 503);
  assert.equal(f.calls.length, 0);
});
test("public offer gets amount from Stripe and never exposes server keys", async (t) => {
  const f = await fixture(t);
  const response = await fetch(`${f.url()}/api/preorder`);
  const offer = await response.json();
  assert.equal(offer.amount, 10000);
  assert.equal(offer.testMode, true);
  assert.equal(JSON.stringify(offer).includes("sk_test_"), false);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("a recurring or mismatched price fails closed", async (t) => {
  const f = await fixture(t);
  f.stripe.prices.retrieve = async () => ({
    active: true,
    type: "recurring",
    currency: "usd",
    unit_amount: 100,
    livemode: false,
  });
  assert.equal((await f.create()).response.status, 503);
  assert.equal(f.calls.length, 0);
});
test("untrusted origin, missing consent, stale terms and client amount injection are rejected", async (t) => {
  const f = await fixture(t);
  const body = {
    requestId: randomUUID(),
    accepted: true,
    termsVersion: "test-v1",
  };
  assert.equal(
    (await f.send("/api/checkout", body, "https://attacker.example")).status,
    403,
  );
  for (const patch of [
    { accepted: false },
    { termsVersion: "old" },
    { amount: 1 },
    { requestId: "bad" },
  ])
    assert.equal(
      (await f.send("/api/checkout", { ...body, ...patch })).status,
      400,
    );
  assert.equal(f.calls.length, 0);
});
test("checkout uses a durable offer snapshot, server price, fixed URLs and idempotent retry", async (t) => {
  const f = await fixture(t);
  const { id, row, response } = await f.create();
  assert.equal(response.status, 200);
  assert.equal((await f.create(id)).response.status, 200);
  assert.equal(f.calls.length, 1);
  const { params, options } = f.calls[0];
  assert.deepEqual(params.line_items, [
    { price: "price_fixture", quantity: 1 },
  ]);
  assert.equal(options.idempotencyKey, `mark-1:${id}`);
  assert.ok(params.success_url.startsWith(env.PUBLIC_ORIGIN));
  assert.ok(params.success_url.includes(row.return_token));
  assert.equal(
    JSON.parse(row.offer_json).refundPolicy,
    env.PREORDER_REFUND_POLICY,
  );
});
test("network retry reuses identical Stripe parameters and idempotency key", async (t) => {
  const f = await fixture(t);
  const original = f.stripe.checkout.sessions.create;
  let attempt = 0,
    initial;
  f.stripe.checkout.sessions.create = async (params, options) => {
    if (!attempt++) {
      initial = JSON.stringify({ params, options });
      throw new Error("network timeout");
    }
    assert.equal(JSON.stringify({ params, options }), initial);
    return original(params, options);
  };
  const { id, response } = await f.create();
  assert.equal(response.status, 503);
  assert.equal((await f.create(id)).response.status, 200);
});
test("forged webhook cannot record an order", async (t) => {
  const f = await fixture(t);
  const response = await f.send("/api/stripe/webhook", {
    type: "checkout.session.completed",
  });
  assert.equal(response.status, 400);
  assert.equal(
    f.store.db.prepare("SELECT COUNT(*) AS n FROM stripe_events").get().n,
    0,
  );
});
test("signed paid event records once; duplicate and late events cannot downgrade payment", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  const event = f.event(row);
  assert.equal((await f.webhook(event)).status, 200);
  assert.equal((await f.webhook(event)).status, 200);
  assert.equal(
    f.store.db.prepare("SELECT COUNT(*) AS n FROM stripe_events").get().n,
    1,
  );
  await f.webhook(
    f.event(row, "checkout.session.async_payment_failed", "unpaid"),
  );
  assert.equal(f.store.getSession(row.session_id).status, "paid");
  assert.equal(f.store.getSession(row.session_id).email, "buyer@example.com");
});
test("unpaid completion is pending; async success confirms; failures remain unconfirmed", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  await f.webhook(f.event(row, "checkout.session.completed", "unpaid"));
  assert.equal(f.store.getSession(row.session_id).status, "pending");
  await f.webhook(
    f.event(row, "checkout.session.async_payment_failed", "unpaid"),
  );
  assert.equal(f.store.getSession(row.session_id).status, "failed");
  await f.webhook(
    f.event(row, "checkout.session.async_payment_succeeded", "paid"),
  );
  assert.equal(f.store.getSession(row.session_id).status, "paid");
});
test("wrong amount or currency cannot mark a reservation paid", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  assert.equal(
    (await f.webhook(f.event(row, undefined, undefined, { amount_total: 1 })))
      .status,
    500,
  );
  assert.equal(
    (await f.webhook(f.event(row, undefined, undefined, { currency: "usd" })))
      .status,
    500,
  );
  assert.equal(f.store.getSession(row.session_id).status, "pending");
});
test("status requires private return token and reveals no customer personal information", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  await f.webhook(f.event(row));
  const endpoint = `${f.url()}/api/checkout/status?session_id=${row.session_id}`;
  assert.equal((await fetch(endpoint)).status, 404);
  assert.equal(
    (await fetch(`${endpoint}&token=${"a".repeat(64)}`)).status,
    404,
  );
  const result = await (
    await fetch(`${endpoint}&token=${row.return_token}`)
  ).json();
  assert.equal(result.status, "paid");
  assert.equal(JSON.stringify(result).includes("buyer@example.com"), false);
  assert.equal(result.payment_intent, undefined);
});
test("database failure returns retryable webhook error without acknowledging payment", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  f.store.recordEvent = () => {
    throw new Error("disk unavailable");
  };
  assert.equal((await f.webhook(f.event(row))).status, 500);
});
test("signed refunds update the ledger without late payment events undoing refunds", async (t) => {
  const f = await fixture(t);
  const { row } = await f.create();
  await f.webhook(f.event(row));
  const refund = (amount) => ({
    id: `evt_${randomUUID()}`,
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_fixture",
        payment_intent: "pi_fixture",
        currency: "cad",
        amount: 10000,
        amount_refunded: amount,
        livemode: false,
      },
    },
  });
  assert.equal((await f.webhook(refund(5000))).status, 200);
  assert.equal(f.store.getSession(row.session_id).status, "partially_refunded");
  await f.webhook(refund(10000));
  await f.webhook(refund(5000));
  await f.webhook(f.event(row));
  assert.equal(f.store.getSession(row.session_id).status, "refunded");
});
test("checkout and consent snapshot survive reopening persistent storage", async () => {
  const { mkdtempSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const directory = mkdtempSync(join(tmpdir(), "mark1-ledger-test-"));
  const filename = join(directory, "orders.sqlite");
  const id = randomUUID();
  try {
    let store = openStore(filename);
    const original = store.createDraft(id, {
      termsVersion: "fixture-v1",
      terms: "Accepted fixture terms",
    });
    store.attachSession(id, {
      id: "cs_test_persistent_fixture",
      url: "https://checkout.stripe.com/c/pay/fixture",
    });
    store.close();
    store = openStore(filename);
    const restored = store.getSession("cs_test_persistent_fixture");
    assert.equal(restored.request_id, id);
    assert.equal(restored.return_token, original.return_token);
    assert.equal(
      JSON.parse(restored.offer_json).terms,
      "Accepted fixture terms",
    );
    store.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
