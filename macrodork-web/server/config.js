export function readConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const origin = env.PUBLIC_ORIGIN || "http://localhost:5173";
  const config = {
    enabled: env.PREORDERS_ENABLED === "true",
    production,
    origin,
    stripeKey: env.STRIPE_SECRET_KEY || "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    priceId: env.STRIPE_PRICE_ID || "",
    currency: (env.PREORDER_CURRENCY || "").toLowerCase(),
    mode: env.PREORDER_MODE || "",
    termsVersion: env.PREORDER_TERMS_VERSION || "",
    terms: env.PREORDER_TERMS || "",
    refundPolicy: env.PREORDER_REFUND_POLICY || "",
    deliveryEstimate: env.PREORDER_DELIVERY_ESTIMATE || "",
    balanceStatement: env.PREORDER_BALANCE_STATEMENT || "",
    merchantName: env.MERCHANT_NAME || "",
    supportEmail: env.SUPPORT_EMAIL || "",
    privacyNotice: env.PREORDER_PRIVACY_NOTICE || "",
    liveApproved: env.ALLOW_LIVE_PAYMENTS === "true",
    countries: (env.PREORDER_COUNTRIES || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  };
  const errors = [];
  let url;
  try {
    url = new URL(origin);
  } catch {
    errors.push("PUBLIC_ORIGIN must be an absolute URL");
  }
  if (
    url &&
    (url.origin !== origin ||
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password)
  )
    errors.push("PUBLIC_ORIGIN must be an origin without path or credentials");
  if (production && url?.protocol !== "https:")
    errors.push("Production requires HTTPS");
  if (
    !config.stripeKey.startsWith("sk_test_") &&
    !(config.liveApproved && config.stripeKey.startsWith("sk_live_"))
  )
    errors.push("A test key or explicitly enabled live key is required");
  if (!config.webhookSecret.startsWith("whsec_"))
    errors.push("Webhook signing secret required");
  if (!config.priceId.startsWith("price_"))
    errors.push("Stripe price ID required");
  if (!["cad", "usd", "eur", "gbp"].includes(config.currency))
    errors.push("Offer currency required");
  if (!["deposit", "full"].includes(config.mode))
    errors.push("Offer mode required");
  for (const key of [
    "termsVersion",
    "terms",
    "refundPolicy",
    "deliveryEstimate",
    "balanceStatement",
    "merchantName",
    "privacyNotice",
  ]) {
    if (!config[key].trim()) errors.push(`${key} required`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail))
    errors.push("Support email required");
  if (
    !config.countries.length ||
    config.countries.some((c) => !/^[A-Z]{2}$/.test(c))
  )
    errors.push("At least one allowed delivery country required");
  return { ...config, errors, ready: config.enabled && errors.length === 0 };
}

export async function getOffer(config, stripe) {
  if (!config.ready || !stripe) return { enabled: false };
  const price = await stripe.prices.retrieve(config.priceId);
  const live = config.stripeKey.startsWith("sk_live_");
  if (
    !price.active ||
    price.type !== "one_time" ||
    price.currency !== config.currency ||
    !Number.isSafeInteger(price.unit_amount) ||
    price.unit_amount <= 0 ||
    price.livemode !== live
  ) {
    throw new Error(
      "Configured Stripe price does not match the approved offer",
    );
  }
  return {
    enabled: true,
    amount: price.unit_amount,
    currency: price.currency,
    testMode: !live,
    mode: config.mode,
    termsVersion: config.termsVersion,
    terms: config.terms,
    refundPolicy: config.refundPolicy,
    deliveryEstimate: config.deliveryEstimate,
    balanceStatement: config.balanceStatement,
    merchantName: config.merchantName,
    supportEmail: config.supportEmail,
    privacyNotice: config.privacyNotice,
    countries: config.countries,
  };
}
