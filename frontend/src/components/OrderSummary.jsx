import { formatPrice } from "../utils/format.js";

// items: [{ key, name, price, quantity }]
// Hierarchy: title -> item count -> line items (name x qty, line total) ->
// emphasized total -> caller actions (children) -> trust reassurances. No motion of its own.
function OrderSummary({ items, total, title = "Order Summary", children }) {
  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const label = `${title}, ${count} item${count === 1 ? "" : "s"}`;

  return (
    <section className="summary" aria-label={label}>
      <style>{`
        .summary-safe {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--forest-soft);
          border: 2px solid var(--forest);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--forest);
          margin-bottom: 12px;
        }
        .summary-trust {
          list-style: none;
          padding: 12px 0 0;
          margin: 12px 0 0;
          border-top: 2px dashed var(--line-strong);
          display: grid;
          gap: 6px;
          font-size: 0.83rem;
          color: var(--muted);
        }
        .summary-trust li {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .summary-trust span[aria-hidden="true"] {
          color: var(--forest);
          font-weight: 800;
        }
      `}</style>
      <div className="summary-safe">
        <span aria-hidden="true">🔒</span> Secure checkout · cart saved until paid
      </div>
      <h2>{title}</h2>
      <p className="muted" aria-live="polite">
        {count} item{count === 1 ? "" : "s"}
      </p>
      {items.length === 0 ? (
        <p className="muted">No items.</p>
      ) : (
        <ul className="summary-lines">
          {items.map((item) => (
            <li key={item.key}>
              <span>
                {item.name} <span className="muted">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="summary-total" aria-live="polite">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      {children}
      <ul className="summary-trust" aria-label="Why this checkout feels safe">
        <li>
          <span aria-hidden="true">✓</span> Final amount is calculated by the server, not the browser.
        </li>
        <li>
          <span aria-hidden="true">✓</span> Payment verified by signature before your cart clears.
        </li>
        <li>
          <span aria-hidden="true">✓</span> Easy 7-day returns · dispatch within a day.
        </li>
      </ul>
    </section>
  );
}

export default OrderSummary;
