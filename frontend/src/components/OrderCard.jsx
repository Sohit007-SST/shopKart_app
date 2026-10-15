import { Link } from "react-router-dom";
import { formatDate, formatPrice, shortId } from "../utils/format.js";
import OrderTracker from "./OrderTracker.jsx";

const STATUS_ICON = { PLACED: "🧾", CONFIRMED: "📦", SHIPPED: "🚚", DELIVERED: "🏠" };
const PREVIEW_COUNT = 3;

// Same data contract: { order }. Only the presentation changed —
// status icon, payment chip, item preview with "+N more", live tracker.
function OrderCard({ order }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const visibleItems = order.items.slice(0, PREVIEW_COUNT);
  const hiddenCount = order.items.length - visibleItems.length;
  const isPaid = order.paymentStatus === "PAID";

  return (
    <article className="card order-card" style={{ animation: "fadeUp var(--motion-card) var(--motion-ease)" }}>
      <div className="order-card-head">
        <div>
          <h3>
            <span aria-hidden="true">{STATUS_ICON[order.status] || "📦"} </span>
            Order {shortId(order._id)}
          </h3>
          <p className="muted">
            {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span
            className="tag"
            style={
              isPaid
                ? { background: "var(--forest-soft)", color: "var(--forest)" }
                : { background: "var(--mustard-soft)", color: "#7a4d00" }
            }
          >
            {isPaid ? "✓ Paid" : order.paymentStatus || "Unpaid"}
          </span>
          <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
        </div>
      </div>

      <ul className="order-card-items">
        {visibleItems.map((item) => (
          <li key={item.product}>
            {item.name} × {item.quantity}
          </li>
        ))}
        {hiddenCount > 0 && <li>+{hiddenCount} more item{hiddenCount === 1 ? "" : "s"} inside →</li>}
      </ul>

      <OrderTracker status={order.status} compact />

      <div className="order-card-foot">
        <p>
          Total: <strong>{formatPrice(order.totalAmount)}</strong>
        </p>
        <Link to={`/orders/${order._id}`} className="btn btn-outline btn-small" aria-label={`View details for order ${shortId(order._id)}`}>
          View Details →
        </Link>
      </div>
    </article>
  );
}

export default OrderCard;
