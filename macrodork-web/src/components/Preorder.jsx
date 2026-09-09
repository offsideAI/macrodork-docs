import { useEffect, useRef, useState } from "react";
export const money = (amount, currency) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "code",
  }).format(amount / 100);
export default function Preorder() {
  const [offer, setOffer] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const requestId = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoadError(false);
    fetch("/api/preorder", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (typeof data.enabled !== "boolean") throw new Error();
        setOffer(data);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  async function checkout(event) {
    event.preventDefault();
    if (!accepted || busy) return;
    setBusy(true);
    setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          accepted: true,
          termsVersion: offer.termsVersion,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Checkout is unavailable. Please try again.",
        );
      const url = new URL(data.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com")
        throw new Error("Checkout is unavailable. Please try again.");
      window.location.assign(url.href);
    } catch (e) {
      setError(e.message || "Could not connect. Please try again.");
      setBusy(false);
    }
  }
  return (
    <section
      className="preorder"
      id="preorder"
      aria-labelledby="preorder-title"
    >
      <div className="wrap preorder-layout">
        <div className="preorder-copy">
          <p className="eyebrow">THE BEGINNING OF SOMETHING PERSONAL</p>
          <h2 id="preorder-title">
            Make room for
            <br />
            <em>what’s next.</em>
          </h2>
          <p>
            Mark 1 is taking its first steps from concept to companion. This is
            where you’ll find preorder availability as we get closer.
          </p>
          <span className="preorder-signature">
            MARK 1 <span>/</span> OFFSIDE ROBOTICS
          </span>
        </div>
        <div className="preorder-panel" aria-busy={busy}>
          <div className="panel-top">
            <span className="eyebrow">MARK 1 / FIRST RELEASE</span>
            <span className="status-dot" />
          </div>
          {loadError ? (
            <div role="status">
              <h3>Let’s reconnect.</h3>
              <p>
                We couldn’t load preorder availability. Please try again in a
                moment.
              </p>
              <button
                className="button"
                onClick={() => setAttempt((n) => n + 1)}
              >
                Try again ↗
              </button>
            </div>
          ) : !offer ? (
            <p role="status">Checking preorder availability…</p>
          ) : !offer.enabled ? (
            <>
              <h3>
                A first hello,
                <br />
                <em>coming into focus.</em>
              </h3>
              <p>
                Preorders aren’t open yet. Pricing, refund terms and delivery
                information will be shared before reservations begin.
              </p>
              <div className="availability-row">
                <span>Development stage</span>
                <strong>Concept → prototype</strong>
              </div>
              <div className="availability-row">
                <span>Launch timing</span>
                <strong>To be announced</strong>
              </div>
              <a className="button" href="#progress">
                See what we’re building <span aria-hidden="true">↗</span>
              </a>
              <p className="small-note">No payment is being collected.</p>
            </>
          ) : (
            <form onSubmit={checkout}>
              {offer.testMode && (
                <p className="test-badge">TEST CHECKOUT · No real payment</p>
              )}
              <h3>
                {offer.mode === "deposit"
                  ? "Reserve your Mark 1."
                  : "Preorder your Mark 1."}
              </h3>
              <p className="preorder-price">
                {money(offer.amount, offer.currency)}
                <span>
                  {offer.mode === "deposit"
                    ? "reservation deposit due today"
                    : "full preorder payment due today"}
                </span>
              </p>
              <p>{offer.balanceStatement}</p>
              <p className="small-note">Delivery: {offer.deliveryEstimate}</p>
              <details className="offer-details">
                <summary>Read preorder & privacy terms</summary>
                <div>
                  <p>
                    <strong>Seller:</strong> {offer.merchantName}
                  </p>
                  <p>{offer.terms}</p>
                  <p>
                    <strong>Refunds:</strong> {offer.refundPolicy}
                  </p>
                  <p>
                    <strong>Privacy:</strong> {offer.privacyNotice}
                  </p>
                  <p>
                    Available delivery countries: {offer.countries.join(", ")}.
                  </p>
                  <p>
                    Questions:{" "}
                    <a href={`mailto:${offer.supportEmail}`}>
                      {offer.supportEmail}
                    </a>
                  </p>
                </div>
              </details>
              <label className="consent">
                <input
                  required
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>
                  I accept the preorder and refund terms and understand that
                  Mark 1 is in development. I have read the privacy notice.
                </span>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button"
                type="submit"
                disabled={!accepted || busy}
              >
                {busy
                  ? "Opening secure checkout…"
                  : `Continue to ${offer.testMode ? "test " : ""}checkout`}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="small-note">
                Payment handled securely by Stripe.{" "}
                {offer.mode === "deposit"
                  ? "This is a deposit, not payment for the complete robot."
                  : "This is a preorder, not an in-stock shipment."}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
