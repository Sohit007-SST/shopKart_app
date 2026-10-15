import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createPaymentOrder, getErrorMessage, reportPaymentFailure, verifyPayment } from "../services/api.js";
import { formatPrice } from "../utils/format.js";
import { loadRazorpayScript } from "../utils/razorpay.js";
import { validateShipping } from "../utils/validation.js";

const STEP_LABELS = {
  creating: "Creating your order...",
  paying: "Waiting for payment...",
  verifying: "Verifying payment...",
};

const STEPS = ["Shipping", "Payment", "Review"];

function Checkout() {
  const { user } = useAuth();
  const { cartItems, subtotal, loading, loaded, refreshCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state lives here, in the page that submits it
  const [address, setAddress] = useState({
    fullName: user.fullName,
    phone: user.phone,
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("idle");
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  // Wizard position only: 0 shipping, 1 payment, 2 review. Never drives payment logic.
  const [stage, setStage] = useState(0);

  const busy = step !== "idle";

  // Steps are display-only: idle/creating -> wizard stage, paying/verifying -> payment.
  // Confirmation is reached via the order-success page after verification.
  const activeStep = step === "paying" || step === "verifying" ? 1 : stage;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const goToPayment = () => {
    const validationErrors = validateShipping(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    setStage(1);
  };

  const openRazorpay = (checkout, shippingAddress) => {
    const razorpay = new window.Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: checkout.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
        email: user.email,
      },
      theme: { color: "#1d6b5c" },

      // Called by Razorpay after a successful payment. This does NOT prove the payment -
      // we send the details to our backend, which verifies the signature.
      handler: async (response) => {
        setStep("verifying");
        setMessage("");
        try {
          const result = await verifyPayment({
            shopKartOrderId: checkout.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setCompleted(true);
          clearCart(); // backend cart is already empty -> Navbar shows Cart (0)
          navigate(`/order-success/${result.order._id}`, { replace: true });
        } catch (error) {
          setMessage(`${getErrorMessage(error, "Payment verification failed.")} Your cart has not been cleared.`);
          setStep("idle");
        }
      },

      modal: {
        ondismiss: () => {
          setStep((current) => (current === "verifying" ? current : "idle"));
          setMessage((current) => current || "Payment was cancelled. Your cart has not been cleared.");
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      reportPaymentFailure(checkout.shopKartOrderId).catch(() => {});
      const reason = response.error?.description || "The payment could not be completed.";
      setMessage(`Payment failed: ${reason} Your cart has not been cleared. Please try again.`);
    });

    razorpay.open();
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setMessage("");

    // Basic validation first - don't call the backend if it fails
    const validationErrors = validateShipping(address);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const shippingAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    );

    setStep("creating");

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage("Could not load Razorpay Checkout. Check your internet connection and try again.");
      setStep("idle");
      return;
    }

    let checkout;
    try {
      // Only the address is sent. The server re-checks stock and calculates the total.
      checkout = await createPaymentOrder(shippingAddress);
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not create your order."));
      setStep("idle");
      refreshCart(); // stock or prices may have changed
      return;
    }

    setStep("paying");
    openRazorpay(checkout, shippingAddress);
  };

  if (completed) return <Loader text="Payment verified! Taking you to your order..." />;
  if (loading && !loaded) return <Loader text="Loading your cart..." />;

  if (cartItems.length === 0) {
    return (
      <StateMessage icon="🛒" title="Your cart is empty" text="Add some products before checking out.">
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </StateMessage>
    );
  }

  const summaryItems = cartItems.map((item) => ({
    key: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const trimmed = Object.fromEntries(
    Object.entries(address).map(([key, value]) => [key, (value || "").trim()])
  );
  const addressLine = [trimmed.addressLine1, trimmed.city, trimmed.state, trimmed.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <section>
      <style>{`
        .checkout-steps {
          list-style: none;
          display: flex;
          gap: 0;
          padding: 0;
          margin: 0 0 20px;
        }
        .checkout-steps li {
          flex: 1 1 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 2px solid var(--ink);
          background: var(--surface);
          font-size: 0.88rem;
          color: var(--muted);
          position: relative;
        }
        .checkout-steps li:first-child {
          border-radius: var(--radius-sm) 0 0 var(--radius-sm);
        }
        .checkout-steps li:last-child {
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }
        .checkout-steps li + li {
          border-left: none;
        }
        .checkout-steps li.is-done {
          color: var(--ink);
        }
        .checkout-steps li.is-active {
          background: var(--espresso);
          border-color: var(--espresso);
          color: #f6f1e8;
        }
        .checkout-steps .step-num {
          display: grid;
          place-items: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid var(--line-strong);
          background: var(--surface);
          color: var(--ink);
          font-size: 0.78rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .checkout-steps li.is-done .step-num {
          background: var(--forest);
          border-color: var(--forest);
          color: #fff;
        }
        .checkout-steps li.is-active .step-num {
          background: var(--mustard);
          border-color: var(--mustard);
          color: var(--espresso);
        }
        .checkout-steps .step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .checkout-steps .step-text strong {
          font-size: 0.9rem;
          letter-spacing: -0.01em;
        }
        .checkout-steps .step-text small {
          font-size: 0.72rem;
          opacity: 0.8;
        }
        .checkout-status {
          margin: 0 0 12px;
          font-size: 0.88rem;
        }
        .checkout-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }
        .checkout-panel-head h2 {
          margin: 0 0 2px;
        }
        .pay-card {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          border: 2px solid var(--ink);
          border-radius: var(--radius-sm);
          padding: 14px;
          background: var(--surface-warm);
          box-shadow: var(--shadow-sticker-sm);
          margin-bottom: 12px;
        }
        .pay-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--espresso);
          color: var(--mustard);
          font-size: 1.2rem;
          border: 2px solid var(--ink);
          flex-shrink: 0;
        }
        .pay-steps {
          margin: 8px 0 0;
          padding-left: 18px;
          color: var(--muted);
          font-size: 0.88rem;
        }
        .review-box {
          border: 2px dashed var(--line-strong);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          margin-bottom: 12px;
          background: var(--surface-warm);
        }
        .review-box h3 {
          margin: 0 0 4px;
          font-size: 0.95rem;
        }
        .review-box p {
          margin: 0;
          font-size: 0.92rem;
        }
        .checkout-nav {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .checkout-nav .btn {
          flex: 1 1 140px;
        }
        @media (max-width: 560px) {
          .checkout-steps .step-text small {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .checkout-steps, .checkout-steps * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="page-head">
        <div>
          <span className="tag">Secure checkout</span>
          <h1>Checkout</h1>
          <p className="muted">Three quick steps — your cart is saved until payment succeeds.</p>
        </div>
        <Link to="/cart" className="btn btn-outline">
          ← Back to Cart
        </Link>
      </div>

      <ol className="checkout-steps" aria-label="Checkout progress">
        {STEPS.map((label, index) => {
          const done = index < activeStep;
          const sub = ["Where should we send it?", "UPI · cards · netbanking", "One last look"][index];
          return (
            <li
              key={label}
              className={`${index === activeStep ? "is-active" : ""}${done ? " is-done" : ""}`.trim()}
              aria-current={index === activeStep ? "step" : undefined}
            >
              <span className="step-num" aria-hidden="true">
                {done ? "✓" : index + 1}
              </span>
              <span className="step-text">
                <strong>
                  {index + 1}. {label}
                </strong>
                <small>{sub}</small>
              </span>
            </li>
          );
        })}
      </ol>

      {busy && <p className="checkout-status muted" role="status">{STEP_LABELS[step]}</p>}

      <form className="two-col" onSubmit={handlePlaceOrder} noValidate>
        <div className="card panel">
          {stage === 0 && (
            <div>
              <div className="checkout-panel-head">
                <div>
                  <h2>Shipping details</h2>
                  <p className="muted">We dispatch within a day of payment.</p>
                </div>
                <span className="badge" aria-hidden="true">Step 1 of 3</span>
              </div>
              <CheckoutForm values={address} errors={errors} onChange={handleChange} disabled={busy} />
              <div className="checkout-nav">
                <button type="button" className="btn btn-primary" onClick={goToPayment} disabled={busy}>
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {stage === 1 && (
            <div>
              <div className="checkout-panel-head">
                <div>
                  <h2>Payment</h2>
                  <p className="muted">Encrypted and verified by our server — never by the popup alone.</p>
                </div>
                <span className="badge" aria-hidden="true">Step 2 of 3</span>
              </div>
              <div className="pay-card">
                <span className="pay-mark" aria-hidden="true">◈</span>
                <div>
                  <strong>Razorpay Secure (Test Mode)</strong>
                  <p className="muted" style={{ margin: "2px 0 0" }}>
                    Pay with UPI, cards, or netbanking. No money moves until you confirm in the popup.
                  </p>
                  <ol className="pay-steps">
                    <li>We create your order and lock prices.</li>
                    <li>You approve payment in the Razorpay window.</li>
                    <li>Our server verifies the signature, then clears your cart.</li>
                  </ol>
                </div>
              </div>
              <p className="hint">Delivering to: {addressLine || "— add your address in step 1 —"}</p>
              <div className="checkout-nav">
                <button type="button" className="btn btn-outline" onClick={() => setStage(0)} disabled={busy}>
                  ← Edit address
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStage(2)} disabled={busy}>
                  Review order →
                </button>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div>
              <div className="checkout-panel-head">
                <div>
                  <h2>Review &amp; place order</h2>
                  <p className="muted">Check it once — the server re-checks stock and totals at payment.</p>
                </div>
                <span className="badge" aria-hidden="true">Step 3 of 3</span>
              </div>
              <div className="review-box">
                <h3>Ship to</h3>
                <p>
                  <strong>{trimmed.fullName || "—"}</strong> · {trimmed.phone || "—"}
                  <br />
                  {addressLine || "Address incomplete."}{" "}
                  <button type="button" className="link-button" onClick={() => setStage(0)} disabled={busy}>
                    Edit
                  </button>
                </p>
              </div>
              <div className="review-box">
                <h3>Pay with</h3>
                <p>
                  Razorpay Secure · {formatPrice(subtotal)}{" "}
                  <button type="button" className="link-button" onClick={() => setStage(1)} disabled={busy}>
                    Change
                  </button>
                </p>
              </div>
              {message && <div className="alert alert-error" role="alert">{message}</div>}
              <div className="checkout-nav">
                <button type="button" className="btn btn-outline" onClick={() => setStage(1)} disabled={busy}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? STEP_LABELS[step] : `Place Order · Pay ${formatPrice(subtotal)}`}
                </button>
              </div>
              <p className="hint center">
                Secure payment by Razorpay (Test Mode). The final amount is calculated by the server.
              </p>
            </div>
          )}
        </div>

        <OrderSummary items={summaryItems} total={subtotal}>
          {stage !== 2 && message && <div className="alert alert-error" role="alert">{message}</div>}
          {stage !== 2 && (
            <p className="hint center">You&apos;ll confirm the exact total on the review step.</p>
          )}
        </OrderSummary>
      </form>
    </section>
  );
}

export default Checkout;
