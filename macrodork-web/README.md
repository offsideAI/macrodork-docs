# Mark 1 · Offside Robotics

React/Vite product website for Mark 1, with original concept renders, target specifications, a development timeline and a configurable Stripe preorder flow. Node 22.13+ is required for the server's built-in SQLite database. All product specifications are development targets; no retail price or delivery promise is invented.

## Run locally

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:4242. With no `.env`, the website works and preorders are closed. The server binds to loopback by default. For frontend development, run `npm run dev:server` and `npm run dev` in separate foreground terminals; Vite forwards `/api` to port 4242. Open http://localhost:5173 and use that exact `PUBLIC_ORIGIN` for test checkout. The user's review workflow uses visible application windows on the second monitor.

```sh
npm test                 # fake Stripe API + genuinely signed fixture webhooks; no charges
npm run test:browser     # headed Chrome on the second monitor; start server first
```

Browser tests use installed Google Chrome, one worker, and screen coordinates from the development laptop. Adjust `playwright.config.js` on another machine. Test offer values are synthetic fixtures, not customer pricing.

## Enable Stripe test checkout

1. Copy `.env.example` to `.env`; keep it private. No secret belongs in a `VITE_` variable or frontend source.
2. Set the merchant identity/support address, approved deposit or full-payment offer, refund policy, delivery statement, remaining-balance/tax/shipping statement, privacy notice and supported delivery countries. Use a unique terms revision and change it whenever the offer changes. These are business inputs, not supplied legal terms.
3. In Stripe test mode, create a Mark 1 product and a **fixed, one-time Price** in CAD, USD, EUR or GBP. Enter its `price_…` identifier and `sk_test_…` key. The browser never chooses price, currency or quantity. Today's charge is exactly this price; there is no additional tax/shipping calculation or discount code. The offer must explain what is included and any future balance. Do not enable it until that treatment is settled.
4. Install/use the Stripe CLI and run the following in a foreground terminal:

   ```sh
   stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired,charge.refunded --forward-to localhost:4242/api/stripe/webhook
   ```

   Put its signing secret in `STRIPE_WEBHOOK_SECRET`. This differs from the eventual production endpoint secret.

5. Set `PUBLIC_ORIGIN` to the exact browser origin, `PREORDERS_ENABLED=true`, and restart the server. Missing required configuration causes startup to fail rather than opening an incomplete offer. Live keys additionally require `ALLOW_LIVE_PAYMENTS=true`; leave this false during testing.
6. Complete an actual test Checkout using Stripe test payment details. Verify a signed webhook, one paid database record, customer return status, cancellation, declined payment and refund handling. Tests in this repo do not substitute for this account-specific end-to-end check. Configure payment receipt emails in Stripe; no custom email service or email subscription is implemented.

Official implementation references: [Checkout sessions](https://docs.stripe.com/api/checkout/sessions), [webhook-based fulfillment](https://docs.stripe.com/checkout/fulfillment), [Stripe testing](https://docs.stripe.com/testing).

## Payment and order behavior

- `GET /api/preorder` provides public availability and approved offer data; never secrets.
- `POST /api/checkout` validates the exact browser Origin, request shape and current terms consent. It stores a durable offer/consent snapshot before creating Checkout, including a creation timestamp. A UUID attempt ID is the Stripe idempotency key; retries reuse the same parameters and Checkout URL. Sessions are fixed to quantity one and card payments. Supported destination countries are collected by Stripe.
- `POST /api/stripe/webhook` verifies the signature over the raw body. It matches the session, amount, currency, test/live mode and terms revision against the stored offer, then atomically records the event and payment state. Duplicate event IDs are ignored, older events cannot erase paid/refunded status, and storage failures return an error so Stripe retries.
- `GET /api/checkout/status` requires both the session ID and its random private return token. It returns status and offer information, never customer email or payment details. A success URL alone does not confirm payment. Confirmation polling is bounded and offers a manual retry.
- Refunds are initiated by an operator in Stripe Dashboard. Signed `charge.refunded` events update full/partial refund state. This code does not autonomously ship a robot or issue refunds. Use Stripe Dashboard for customer addresses, payment receipts, disputes and support; the local ledger links through the payment intent and Checkout session.

## Production hosting

Deploy the build **and Node server** behind HTTPS. A static-only Vite host cannot process payments. This implementation is for one Node instance with SQLite on a persistent private volume; it is not an ephemeral serverless deployment or multi-instance database architecture.

Set `NODE_ENV=production`, HTTPS `PUBLIC_ORIGIN`, `HOST=0.0.0.0` if needed by the platform, the platform's `PORT`, and an absolute persistent `ORDER_DB_PATH`. Configure `TRUST_PROXY_HOPS` only for a verified reverse-proxy topology. Keep database/WAL files outside the public directory, restrict access, back them up consistently and test restoration. The ledger contains email, offer/consent records and checkout return tokens. Configure retention/deletion and redact query strings from access logs; never expose a ledger endpoint publicly.

Register the public `/api/stripe/webhook` endpoint for the event types above, use its production signing secret, and monitor Stripe event delivery failures and server errors. Checkout gating does not stop existing payment/refund webhooks from being processed. Reconcile the ledger against Stripe after outages. Keep one worker or replace the local rate limiter and database with shared services before scaling horizontally.

Before live activation: finalize the merchant offer, customer terms/privacy/refund process, price/tax/shipping treatment, country availability, domain, support address and receipts; finish Stripe account onboarding and account-specific test Checkout; then configure the live Price/key/webhook secret and explicit live flag. No live setup, deployment or charge was performed by this implementation task.

## Product and asset sources

- `src/data.js`: Mark 1 target specifications and FAQs; source is `../Mark-I-Build/PRODUCT-REQUIREMENTS-R001.md`.
- `public/images/mark-1/`: byte-for-byte copies of original Mark 1 R001 Blender renders, not old MacroDork/Microduck imagery.
- `src/components/`: product sections, interactive gallery, preorder form and verified return status.
- `server/`: config validation, Checkout API, signature verification and SQLite persistence.
- `../Mark-I-Build/website/`: implementation plan and verification evidence; `../Mark-I-Build/AUDIT-LOG.md` records work.

The previous robot's copied web assets and unused sections have been removed from this website. Their historical source assets in the parent repository remain unchanged. This does not grant new rights over those earlier assets or claim compatibility with upstream hardware. Google Fonts supplies DM Sans, Instrument Serif and IBM Plex Mono; fallback fonts are declared in CSS. Set absolute canonical/social image URLs when the real production domain is known.

For this laptop, `node scripts/review-browser.js` opens an isolated **visible** Chrome window on LG and stays attached until the window closes. The current layout has the built-in display, Samsung, then LG at x=3976; update the script/test window coordinates if displays change.
