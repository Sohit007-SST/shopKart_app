import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import OrderTracker from "../components/OrderTracker.jsx";
import { fetchOrder, getErrorMessage } from "../services/api.js";
import { formatDateTime, formatPrice, shortId } from "../utils/format.js";

// Receipt-style confirmation screen with a celebratory head and a
// tracking teaser. Celebration is CSS-only and fully disabled under
// prefers-reduced-motion (nothing essential depends on animation).
function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(getErrorMessage(err, "Could not load your order.")));
  }, [id]);

  if (error) {
    return (
      <StateMessage icon="⚠️" tone="error" title="Something went wrong" text={error}>
        <Link to="/orders" className="btn btn-primary">
          View My Orders
        </Link>
      </StateMessage>
    );
  }

  if (!order) return <Loader text="Loading your receipt..." />;

  if (order.paymentStatus !== "PAID") {
    return (
      <StateMessage icon="⏳" title="Payment not completed" text="This order has not been paid, so it was not placed. Your cart is unchanged.">
        <Link to="/cart" className="btn btn-primary">
          Back to Cart
        </Link>
      </StateMessage>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <section className="receipt-wrap success-celebration" aria-label="Order confirmation">
      <style>{`
        .success-celebration {
          max-width: 560px;
        }
        .success-burst {
          text-align: center;
          margin-bottom: 14px;
          position: relative;
        }
        .success-confetti {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 1.2rem;
          margin-bottom: 6px;
        }
        .success-confetti span {
          display: inline-block;
          animation: confettiFloat 2.4s ease-in-out infinite;
        }
        .success-confetti span:nth-child(2) { animation-delay: 0.3s; }
        .success-confetti span:nth-child(3) { animation-delay: 0.6s; }
        .success-confetti span:nth-child(4) { animation-delay: 0.9s; }
        .success-confetti span:nth-child(5) { animation-delay: 1.2s; }
        @keyframes confettiFloat {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-6px) rotate(6deg); }
        }
        .receipt-check {
          animation: checkPop 0.5s cubic-bezier(0.22, 0.61, 0.21, 1);
        }
        @keyframes checkPop {
          from { transform: scale(0.6); }
          to { transform: scale(1); }
        }
        .tracking-teaser {
          margin-top: 20px;
          background: var(--surface);
          border: 2px solid var(--ink);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sticker-sm);
          padding: 18px;
        }
        .tracking-teaser h2 {
          margin: 0 0 2px;
          font-size: 1.2rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .success-confetti span, .receipt-check {
            animation: none !important;
          }
        }
      `}</style>

      <div className="success-burst">
        <div className="success-confetti" aria-hidden="true">
          <span>🎉</span>
          <span>✨</span>
          <span>🎊</span>
          <span>✨</span>
          <span>🎉</span>
        </div>
      </div>

      <div className="receipt">
        <div className="receipt-head">
          <div className="receipt-check" aria-hidden="true">
            ✓
          </div>
          <p className="muted">Payment confirmed</p>
          <h1>Order Placed Successfully</h1>
          <p className="muted">Thank you for shopping with ShopKart! A confirmation is on its way.</p>
        </div>

        <dl className="receipt-meta">
          <div>
            <dt>Order ID</dt>
            <dd title={order._id}>{shortId(order._id)}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDateTime(order.paidAt || order.createdAt)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{order.status}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{order.paymentStatus}</dd>
          </div>
        </dl>

        <h2 className="muted">
          Items ({itemCount})
        </h2>
        <ul className="receipt-items">
          {order.items.map((item) => (
            <li key={item.product}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="receipt-total">
          <span>Total Paid</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>

        <p className="receipt-note">
          Shipping to {order.shippingAddress.fullName}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
          <br />
          Payment ID: {order.razorpayPaymentId}
        </p>
      </div>

      <div className="tracking-teaser">
        <span className="tag">Live tracking teaser</span>
        <h2>Where&apos;s my order?</h2>
        <p className="muted">Freshly placed — we pack within a day. Follow every hop here:</p>
        <OrderTracker status={order.status} />
        <p className="hint">
          Next stop: <strong>Confirmed</strong>, then Shipped with doorstep delivery. Full timeline lives on your
          order page.
        </p>
        <div className="receipt-actions" style={{ marginTop: "14px" }}>
          <Link to={`/orders/${order._id}`} className="btn btn-primary">
            Track this order →
          </Link>
          <Link to="/orders" className="btn btn-outline">
            View My Orders
          </Link>
        </div>
      </div>

      <div className="receipt-actions">
        <Link to="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

export default OrderSuccess;
