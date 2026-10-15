import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OrderCard from "../components/OrderCard.jsx";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import { fetchOrders } from "../services/api.js";

const FILTERS = ["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// API unchanged: fetchOrders() only. Added a client-side status filter
// and a staggered entrance so the list feels alive.
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const counts = useMemo(() => {
    const map = { ALL: orders.length };
    for (const order of orders) map[order.status] = (map[order.status] || 0) + 1;
    return map;
  }, [orders]);

  const visible = filter === "ALL" ? orders : orders.filter((order) => order.status === filter);
  const delivered = counts.DELIVERED || 0;

  if (loading) return <Loader text="Loading your orders..." />;

  if (error) {
    return (
      <StateMessage icon="🛰️" tone="error" title="Unable to load your orders." text="The delivery pigeons lost the parcel list. Give it another go.">
        <button type="button" className="btn btn-primary" onClick={loadOrders}>
          Try Again
        </button>
      </StateMessage>
    );
  }

  if (orders.length === 0) {
    return (
      <StateMessage icon="📦" title="You have not placed any orders yet." text="Your orders and their delivery progress will show up here — tracked dot by dot, van by van.">
        <Link to="/products" className="btn btn-primary">
          Start Shopping
        </Link>
      </StateMessage>
    );
  }

  return (
    <section aria-label="My orders">
      <div className="page-head">
        <div>
          <p className="eyebrow">Track every parcel</p>
          <h1>
            My Orders <em>({orders.length})</em>
          </h1>
          <p className="muted">
            Newest first
            {delivered > 0 && ` · 🎉 ${delivered} delivered to your door`}
          </p>
        </div>
        <Link to="/products" className="btn btn-outline btn-small">
          Continue Shopping
        </Link>
      </div>

      <div
        role="group"
        aria-label="Filter orders by status"
        style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}
      >
        {FILTERS.map((status) => {
          const active = filter === status;
          const count = counts[status] || 0;
          if (status !== "ALL" && count === 0) return null;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              aria-pressed={active}
              className={`btn btn-small ${active ? "btn-primary" : "btn-outline"}`}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <StateMessage icon="🔎" title={`No ${filter.toLowerCase()} orders`} text="Nothing with this status right now — try another filter.">
          <button type="button" className="btn btn-outline btn-small" onClick={() => setFilter("ALL")}>
            Show all orders
          </button>
        </StateMessage>
      ) : (
        <div className="order-list">
          {visible.map((order, index) => (
            <div
              key={order._id}
              style={{
                animation: "fadeUp var(--motion-card) var(--motion-ease) backwards",
                animationDelay: `${Math.min(index, 6) * 60}ms`,
              }}
            >
              <OrderCard order={order} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Orders;
