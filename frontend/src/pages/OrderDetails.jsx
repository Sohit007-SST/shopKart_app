import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import OrderTracker from "../components/OrderTracker.jsx";
import { advanceOrderStatus, fetchOrder, getErrorMessage } from "../services/api.js";
import { formatDateTime, formatPrice, handleImageError, shortId } from "../utils/format.js";

const NEXT_STATUS = { PLACED: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED" };
const STEP_INDEX = { PLACED: 1, CONFIRMED: 2, SHIPPED: 3, DELIVERED: 4 };

const STATUS_STORY = {
  PLACED: { icon: "🧾", line: "Order received — the seller is reading your list." },
  CONFIRMED: { icon: "📦", line: "Packed and labelled — your box is taped shut." },
  SHIPPED: { icon: "🚚", line: "On the road — the van is humming your way." },
  DELIVERED: { icon: "🎉", line: "Delivered — go on, tear that tape off!" },
};

// API unchanged: fetchOrder(id) + advanceOrderStatus(id, next).
// Added a living status banner, step counter, and richer summary.
function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    setOrder(null);
    setError(null);
    fetchOrder(id)
      .then((data) => !ignore && setOrder(data.order))
      .catch((err) => !ignore && setError(getErrorMessage(err, "Could not load this order.")));
    return () => {
      ignore = true;
    };
  }, [id]);

  // Bonus: demo-only button that moves the order to the next status
  const handleAdvance = async () => {
    setUpdating(true);
    setUpdateError("");
    try {
      const data = await advanceOrderStatus(order._id, NEXT_STATUS[order.status]);
      setOrder(data.order);
    } catch (err) {
      setUpdateError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyPaymentId = async () => {
    try {
      await navigator.clipboard.writeText(order.razorpayPaymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (error) {
    return (
      <StateMessage icon="🔎" tone="error" title="Order not found" text={error}>
        <Link to="/orders" className="btn btn-primary">
          Back to My Orders
        </Link>
      </StateMessage>
    );
  }

  if (!order) return <Loader text="Loading order..." />;

  const address = order.shippingAddress || {};
  const isPaid = order.paymentStatus === "PAID";
  const story = STATUS_STORY[order.status];
  const stepNumber = STEP_INDEX[order.status] || 0;
  const delivered = order.status === "DELIVERED";

  return (
    <section aria-label={`Order ${shortId(order._id)}`}>
      <Link to="/orders" className="back-link">
        ← Back to My Orders
      </Link>

      <div className="page-head">
        <div>
          <p className="eyebrow">Track your parcel</p>
          <h1>Order {shortId(order._id)}</h1>
          <p className="muted">
            Placed on {formatDateTime(order.createdAt)}
            {stepNumber > 0 && ` · Step ${stepNumber} of 4`}
          </p>
        </div>
        <span className={`badge badge-${String(order.status).toLowerCase()}`}>{order.status}</span>
      </div>

      {isPaid ? (
        <div
          className="card panel tracker-panel"
          style={
            delivered
              ? { borderColor: "var(--forest)", background: "var(--forest-soft)" }
              : undefined
          }
        >
          {story && (
            <p
              role="status"
              style={{
                margin: "0 0 12px",
                fontWeight: 700,
                fontSize: "1.02rem",
                letterSpacing: "-0.01em",
              }}
            >
              <span aria-hidden="true">{story.icon} </span>
              {story.line}
            </p>
          )}
          <OrderTracker status={order.status} />
          {NEXT_STATUS[order.status] && (
            <div className="dev-tools">
              <button type="button" className="btn btn-small btn-outline" onClick={handleAdvance} disabled={updating}>
                {updating ? "Updating..." : `Simulate next step → ${NEXT_STATUS[order.status]}`}
              </button>
              <span className="hint">Demo only - stands in for an admin panel.</span>
            </div>
          )}
          {updateError && (
            <p className="field-error" role="alert">
              {updateError}
            </p>
          )}
        </div>
      ) : (
        <div className="alert alert-error tracker-panel" role="alert">
          ⛔ This order was not paid ({order.paymentStatus}), so it was never placed.
        </div>
      )}

      <div className="two-col">
        <div className="card panel">
          <h2>
            Items ({order.items.length})
          </h2>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.product}>
                <img src={item.image} alt={item.name} onError={handleImageError} />
                <div>
                  <Link to={`/products/${item.product}`}>{item.name}</Link>
                  <p className="muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <p className="hint">Prices shown are what you paid at the time of purchase.</p>
        </div>

        <aside className="summary" aria-label="Order summary">
          <h2>Summary</h2>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="summary-row">
            <span>Payment</span>
            <span>{isPaid ? "✓ " : ""}{order.paymentStatus}</span>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <span>{order.status}</span>
          </div>
          <div className="summary-row small">
            <span>Order ID</span>
            <span>{order._id}</span>
          </div>
          {order.razorpayPaymentId && (
            <div className="summary-row small">
              <span>Payment ID</span>
              <span>
                {order.razorpayPaymentId}{" "}
                <button
                  type="button"
                  className="link-button"
                  onClick={handleCopyPaymentId}
                  aria-label="Copy payment ID"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </span>
            </div>
          )}
          <h3>Shipping To</h3>
          {address.fullName ? (
            <address>
              {address.fullName}
              <br />
              {address.addressLine1}
              <br />
              {address.city}, {address.state} - {address.pincode}
              <br />
              📞 {address.phone}
            </address>
          ) : (
            <p className="muted">No shipping address on this order.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default OrderDetails;
