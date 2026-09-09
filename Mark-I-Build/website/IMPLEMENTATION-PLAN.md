# Mark 1 website and preorder implementation

2026-09-07 — User authorized replacement of the existing macrodork-web website with a premium Mark 1 presentation, renders, product information and Stripe preorder code. Website source belongs in macrodork-web as explicitly requested; plans, asset provenance, verification evidence and audit remain under Mark-I-Build.

Visual direction: warm paper, graphite, silver renders and restrained amber details; large editorial typography, full-height product photography, clear technical specifications and a visible development timeline. Keep mobile navigation, keyboard operation, reduced motion and error/loading states usable.

Product copy follows PRODUCT-REQUIREMENTS-R001.md and design/MARK-I-R001.md. Mark 1 is a 60-inch wheeled companion concept entering mechanical development. Images are original R001 concept renders, not photographs of a tested prototype. Do not reuse the old robot's bipedal, files-released, runtime, licensing or price claims. CAD $800 is not a retail price. No Asimov compatibility or final production specification has been verified.

Use React/Vite frontend plus Node/Express backend, Stripe hosted Checkout, signed webhooks and a persistent SQLite order ledger. Price, offer terms and URLs are server-controlled. Checkout is closed by default, including if configuration is incomplete. The business question (deposit/full payment/updates, amount/currency, refund and delivery terms) has been asked once and remains pending. No live keys, merchant details or domain have been supplied.

Required implementation checks: build; server tests for disabled checkout, trusted pricing, consent, origin restrictions, idempotent paid webhook recording, failed/pending payments and payment-status privacy; browser checks at phone/tablet/desktop sizes, navigation, gallery, FAQ and preorder states. Use a visible browser on LG for application inspection. Do not deploy, contact customers or charge a real card in this task.

Asset copies: public/images/mark-1/{hero,front,rear,head}.png are byte-for-byte copies of renders/mark-i-r001-{hero,front,rear,head-detail}.png. Preserve source renders. No new image generation or image editing needed.

References checked: https://docs.stripe.com/checkout/fulfillment and https://docs.stripe.com/api/checkout/sessions. Agent-reach/Jina official-document read initially failed sandbox DNS, then succeeded with escalation. Web search also returned official Stripe guidance. Fulfillment must derive from verified payment state, never merely a browser success redirect.
