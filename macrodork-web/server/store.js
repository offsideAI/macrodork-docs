import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

const digest = (value) => createHash("sha256").update(value).digest();
export function openStore(filename) {
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  if (filename !== ":memory:") chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS checkouts (
      request_id TEXT PRIMARY KEY, session_id TEXT UNIQUE, checkout_url TEXT,
      return_token TEXT NOT NULL, offer_json TEXT NOT NULL, params_json TEXT,
      created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      email TEXT, payment_intent TEXT, amount_paid INTEGER, updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS refunds (charge_id TEXT PRIMARY KEY, amount_refunded INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS stripe_events (id TEXT PRIMARY KEY, type TEXT NOT NULL, received_at TEXT NOT NULL);`);
  return {
    db,
    getRequest: (id) =>
      db.prepare("SELECT * FROM checkouts WHERE request_id = ?").get(id),
    getSession: (id) =>
      db.prepare("SELECT * FROM checkouts WHERE session_id = ?").get(id),
    createDraft(id, offer) {
      const token = randomBytes(32).toString("hex");
      db.prepare(
        "INSERT OR IGNORE INTO checkouts (request_id, return_token, offer_json, created_at) VALUES (?, ?, ?, ?)",
      ).run(id, token, JSON.stringify(offer), new Date().toISOString());
      return this.getRequest(id);
    },
    setParams(id, params) {
      db.prepare(
        "UPDATE checkouts SET params_json = ? WHERE request_id = ? AND params_json IS NULL",
      ).run(JSON.stringify(params), id);
    },
    attachSession(id, session) {
      db.prepare(
        "UPDATE checkouts SET session_id = ?, checkout_url = ? WHERE request_id = ?",
      ).run(session.id, session.url, id);
    },
    authenticate(row, token) {
      return (
        !!row &&
        typeof token === "string" &&
        token.length === 64 &&
        timingSafeEqual(digest(row.return_token), digest(token))
      );
    },
    hasEvent: (id) =>
      !!db.prepare("SELECT id FROM stripe_events WHERE id = ?").get(id),
    recordEvent(event, row, session, status) {
      db.exec("BEGIN IMMEDIATE");
      try {
        if (this.hasEvent(event.id)) {
          db.exec("COMMIT");
          return;
        }
        // Never downgrade a paid record because Stripe delivers an older event late.
        db.prepare(
          `UPDATE checkouts SET session_id = COALESCE(session_id, ?),
          status = CASE WHEN status IN ('paid','refunded','partially_refunded') THEN status WHEN status IN ('failed','expired') AND ? = 'pending' THEN status ELSE ? END,
          email = COALESCE(?, email), payment_intent = COALESCE(?, payment_intent),
          amount_paid = CASE WHEN ? = 'paid' THEN ? ELSE amount_paid END, updated_at = ?
          WHERE request_id = ?`,
        ).run(
          session.id,
          status,
          status,
          session.customer_details?.email || null,
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
          status,
          session.amount_total ?? null,
          new Date().toISOString(),
          row.request_id,
        );
        db.prepare("INSERT INTO stripe_events VALUES (?, ?, ?)").run(
          event.id,
          event.type,
          new Date().toISOString(),
        );
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    recordRefund(event, charge) {
      const row = db
        .prepare("SELECT * FROM checkouts WHERE payment_intent = ?")
        .get(charge.payment_intent);
      if (!row) {
        if (charge.metadata?.product === "mark-1")
          throw new Error("Payment event must arrive before refund");
        return;
      }
      const offer = JSON.parse(row.offer_json);
      if (
        charge.currency !== offer.currency ||
        charge.amount !== offer.amount ||
        charge.livemode === offer.testMode
      )
        throw new Error("Refund does not match offer");
      db.exec("BEGIN IMMEDIATE");
      try {
        if (this.hasEvent(event.id)) {
          db.exec("COMMIT");
          return;
        }
        db.prepare(
          "INSERT INTO refunds VALUES (?, ?) ON CONFLICT(charge_id) DO UPDATE SET amount_refunded = MAX(amount_refunded, excluded.amount_refunded)",
        ).run(charge.id, charge.amount_refunded);
        const amount = db
          .prepare("SELECT amount_refunded FROM refunds WHERE charge_id = ?")
          .get(charge.id).amount_refunded;
        const status =
          amount >= charge.amount ? "refunded" : "partially_refunded";
        db.prepare(
          "UPDATE checkouts SET status = ?, updated_at = ? WHERE request_id = ?",
        ).run(status, new Date().toISOString(), row.request_id);
        db.prepare("INSERT INTO stripe_events VALUES (?, ?, ?)").run(
          event.id,
          event.type,
          new Date().toISOString(),
        );
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    close() {
      db.close();
    },
  };
}
