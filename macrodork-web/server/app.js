import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { resolve } from "node:path";
import { getOffer } from "./config.js";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION = /^cs_(test_|live_)?[a-zA-Z0-9_]{8,200}$/;
const events = new Set([
  "charge.refunded",
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
]);
export function createApp({
  config,
  stripe,
  store,
  distPath,
  trustProxy = false,
  logger = console,
}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy);
  app.use(
    helmet({
      strictTransportSecurity: config.production ? undefined : false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: config.production ? [] : null,
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  // Stripe signs raw bytes. This route must precede JSON parsing and browser origin checks.
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "256kb" }),
    async (req, res) => {
      if (!stripe || !config.webhookSecret)
        return res.status(503).json({ error: "Webhook unavailable" });
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.get("stripe-signature"),
          config.webhookSecret,
        );
      } catch {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
      if (!events.has(event.type) || store.hasEvent(event.id))
        return res.json({ received: true });
      try {
        if (event.type === "charge.refunded") {
          store.recordRefund(event, event.data.object);
          return res.json({ received: true });
        }
        const session = event.data.object;
        if (session.metadata?.product !== "mark-1")
          return res.json({ received: true });
        const row = store.getRequest(session.metadata.request_id);
        if (!row)
          throw new Error("No durable checkout draft for Mark 1 payment");
        const offer = JSON.parse(row.offer_json);
        if (
          (row.session_id && row.session_id !== session.id) ||
          session.mode !== "payment" ||
          session.currency !== offer.currency ||
          session.amount_total !== offer.amount ||
          session.livemode === offer.testMode ||
          session.metadata.terms_version !== offer.termsVersion
        ) {
          throw new Error("Payment does not match stored offer");
        }
        let status = "pending";
        if (session.payment_status === "paid") status = "paid";
        else if (event.type === "checkout.session.async_payment_failed")
          status = "failed";
        else if (event.type === "checkout.session.expired") status = "expired";
        store.recordEvent(event, row, session, status);
        return res.json({ received: true });
      } catch (error) {
        logger.error("Stripe event could not be recorded", {
          eventId: event.id,
          message: error.message,
        });
        return res
          .status(500)
          .json({ error: "Payment recording will be retried" });
      }
    },
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 90,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please try again shortly." },
    }),
  );
  app.use(express.json({ limit: "8kb" }));
  app.get("/api/preorder", async (_req, res) => {
    try {
      res.json(await getOffer(config, stripe));
    } catch (error) {
      logger.error("Preorder offer unavailable", {
        code: error.code || "unavailable",
      });
      res.status(503).json({
        enabled: false,
        error: "Preorder information is temporarily unavailable.",
      });
    }
  });
  app.post(
    "/api/checkout",
    rateLimit({
      windowMs: 60_000,
      limit: 8,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Please wait a minute before trying checkout again." },
    }),
    async (req, res) => {
      if (!config.ready)
        return res.status(503).json({ error: "Preorders are not open yet." });
      if (req.get("origin") !== config.origin)
        return res
          .status(403)
          .json({ error: "Request origin is not permitted." });
      const { requestId, accepted, termsVersion } = req.body || {};
      if (
        !UUID.test(requestId || "") ||
        accepted !== true ||
        termsVersion !== config.termsVersion ||
        Object.keys(req.body).some(
          (k) => !["requestId", "accepted", "termsVersion"].includes(k),
        )
      ) {
        return res.status(400).json({
          error: "Please review and accept the current preorder terms.",
        });
      }
      try {
        let row = store.getRequest(requestId);
        // Reuse an attempt only for the same offer revision. Never silently switch its terms.
        if (row && JSON.parse(row.offer_json).termsVersion !== termsVersion)
          return res.status(409).json({
            error: "The offer changed. Refresh this page to review it.",
          });
        if (
          row &&
          (row.status !== "pending" ||
            Date.now() - Date.parse(row.created_at) > 30 * 60_000)
        )
          return res.status(409).json({
            error:
              "This checkout attempt has ended. Refresh the page to start again.",
          });
        if (row?.checkout_url) return res.json({ url: row.checkout_url });
        const offer = row
          ? JSON.parse(row.offer_json)
          : await getOffer(config, stripe);
        if (!offer.enabled)
          return res.status(503).json({ error: "Preorders are not open yet." });
        row ||= store.createDraft(requestId, offer);
        if (!row.params_json) {
          store.setParams(requestId, {
            mode: "payment",
            line_items: [{ price: config.priceId, quantity: 1 }],
            payment_method_types: ["card"],
            billing_address_collection: "required",
            shipping_address_collection: {
              allowed_countries: config.countries,
            },
            success_url: `${config.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&token=${row.return_token}#checkout-status`,
            cancel_url: `${config.origin}/?checkout=cancelled#preorder`,
            expires_at: Math.floor(Date.parse(row.created_at) / 1000) + 31 * 60,
            client_reference_id: requestId,
            metadata: {
              product: "mark-1",
              request_id: requestId,
              terms_version: offer.termsVersion,
              preorder_mode: offer.mode,
            },
            payment_intent_data: {
              metadata: {
                product: "mark-1",
                request_id: requestId,
                terms_version: offer.termsVersion,
              },
            },
            custom_text: {
              submit: {
                message:
                  `${offer.mode === "deposit" ? "Reservation deposit" : "Full preorder payment"} for Mark 1, currently in development. ${offer.deliveryEstimate}`.slice(
                    0,
                    1200,
                  ),
              },
            },
          });
        }
        row = store.getRequest(requestId);
        const session = await stripe.checkout.sessions.create(
          JSON.parse(row.params_json),
          { idempotencyKey: `mark-1:${requestId}` },
        );
        const checkoutUrl = new URL(session.url);
        if (
          checkoutUrl.protocol !== "https:" ||
          checkoutUrl.hostname !== "checkout.stripe.com"
        )
          throw new Error("Unexpected checkout host");
        store.attachSession(requestId, session);
        res.json({ url: session.url });
      } catch (error) {
        logger.error("Checkout unavailable", {
          code: error.code || "unavailable",
        });
        res
          .status(503)
          .json({ error: "Checkout could not be opened. Please try again." });
      }
    },
  );
  app.get("/api/checkout/status", (req, res) => {
    const { session_id: id, token } = req.query;
    if (typeof id !== "string" || !SESSION.test(id))
      return res.status(404).json({ error: "Order not found." });
    const row = store.getSession(id);
    if (!store.authenticate(row, token))
      return res.status(404).json({ error: "Order not found." });
    const offer = JSON.parse(row.offer_json);
    res.json({
      status: row.status,
      mode: offer.mode,
      amount: row.amount_paid ?? offer.amount,
      currency: offer.currency,
      testMode: offer.testMode,
      supportEmail: offer.supportEmail,
      deliveryEstimate: offer.deliveryEstimate,
    });
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API route not found." }),
  );
  if (distPath) {
    app.use(express.static(resolve(distPath), { index: false }));
    app.get("/", (_req, res) => res.sendFile(resolve(distPath, "index.html")));
  }
  app.use((error, _req, res, _next) => {
    const status =
      error.type === "entity.too.large"
        ? 413
        : error instanceof SyntaxError
          ? 400
          : 500;
    res.status(status).json({
      error:
        status < 500
          ? "Invalid request body."
          : "Request could not be processed.",
    });
  });
  return app;
}
