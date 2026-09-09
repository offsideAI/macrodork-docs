import { useEffect, useRef, useState } from "react";
import { money } from "./Preorder.jsx";
export default function CheckoutStatus() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const [order, setOrder] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const region = useRef(null);
  const result = params.get("checkout");
  useEffect(() => {
    if (!result) return;
    region.current?.focus();
    // Remove the bearer token from the address bar and future copied links.
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}#checkout-status`,
    );
  }, [result]);
  useEffect(() => {
    if (result !== "success") return;
    const controller = new AbortController();
    let timer,
      count = 0;
    setWaiting(false);
    async function poll() {
      try {
        const r = await fetch(
          `/api/checkout/status?${new URLSearchParams({ session_id: params.get("session_id") || "", token: params.get("token") || "" })}`,
          { signal: controller.signal },
        );
        if (!r.ok) throw new Error();
        const data = await r.json();
        setOrder(data);
        if (data.status === "pending" && ++count < 12)
          timer = setTimeout(poll, 2500);
        else if (data.status === "pending") setWaiting(true);
      } catch (e) {
        if (e.name === "AbortError") return;
        if (++count < 12) timer = setTimeout(poll, 2500);
        else setWaiting(true);
      }
    }
    poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [result, params, attempt]);
  if (!result) return null;
  const paid = order?.status === "paid";
  return (
    <section
      className="checkout-status wrap"
      id="checkout-status"
      ref={region}
      tabIndex={-1}
      aria-label="Checkout result"
    >
      <div aria-live="polite">
        <p className="eyebrow">MARK 1 / CHECKOUT</p>
        {result === "cancelled" ? (
          <>
            <h2>Checkout closed.</h2>
            <p>
              No order is confirmed here. You can return to the preorder details
              whenever you’re ready.
            </p>
            <a href="#preorder">Back to preorder details ↗</a>
          </>
        ) : paid ? (
          <>
            <h2>
              {order.testMode
                ? "Test payment confirmed."
                : order.mode === "deposit"
                  ? "Your reservation is confirmed."
                  : "Your preorder is confirmed."}
            </h2>
            <p>
              {money(order.amount, order.currency)}{" "}
              {order.mode === "deposit" ? "deposit" : "payment"} recorded
              {order.testMode
                ? " in Stripe test mode; no real order was placed"
                : ""}
              . {order.deliveryEstimate}
            </p>
            <p>
              For questions, contact{" "}
              <a href={`mailto:${order.supportEmail}`}>{order.supportEmail}</a>.
              Keep your Stripe payment receipt.
            </p>
          </>
        ) : ["failed", "expired"].includes(order?.status) ? (
          <>
            <h2>Payment wasn’t completed.</h2>
            <p>Please return to the preorder section to try again.</p>
            <a href="#preorder">Preorder details ↗</a>
          </>
        ) : ["refunded", "partially_refunded"].includes(order?.status) ? (
          <>
            <h2>
              {order.status === "refunded"
                ? "Payment refunded."
                : "Payment partially refunded."}
            </h2>
            <p>
              Contact{" "}
              <a href={`mailto:${order.supportEmail}`}>{order.supportEmail}</a>{" "}
              for your reservation details.
            </p>
          </>
        ) : (
          <>
            <h2>
              {waiting
                ? "Confirmation is taking a little longer."
                : "Checking your payment…"}
            </h2>
            <p>
              We’re waiting for verified payment confirmation. Please don’t pay
              again while this is being checked.
            </p>
            {waiting && (
              <button
                className="button"
                onClick={() => setAttempt((n) => n + 1)}
              >
                Check again
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
