const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
const LABELS = { PLACED: "Placed", CONFIRMED: "Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered" };
const ICONS = { PLACED: "🧾", CONFIRMED: "📦", SHIPPED: "🚚", DELIVERED: "🏠" };
const HINTS = {
  PLACED: "Order received",
  CONFIRMED: "Seller packed it",
  SHIPPED: "On the road",
  DELIVERED: "At your door",
};

// Visual progress of an order: Placed -> Confirmed -> Shipped -> Delivered.
// Unknown statuses (e.g. unpaid orders) render with no step highlighted.
// Same contract: { status, compact }. The timeline now feels alive:
// icons per step, a pulsing "you are here" dot, and a caption under it.
function OrderTracker({ status, compact = false }) {
  const current = STEPS.indexOf(status);

  return (
    <ol className={`tracker ${compact ? "tracker-compact" : ""}`} aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = current >= 0 && index <= current;
        const isCurrent = index === current;
        const isFuture = current >= 0 && index > current;
        return (
          <li
            key={step}
            className={`${done ? "done" : ""}${isCurrent ? " current" : ""}`.trim()}
            aria-current={isCurrent ? "step" : undefined}
            title={`${LABELS[step]}${isCurrent ? " (current step)" : ""}`}
          >
            <span
              className="tracker-dot"
              aria-hidden="true"
              style={
                isCurrent
                  ? {
                      animation: "pulseSoft 1.6s ease-in-out infinite",
                      boxShadow: "0 0 0 4px var(--primary-soft), 0 0 14px rgba(200, 80, 46, 0.55)",
                      borderColor: "var(--primary)",
                    }
                  : undefined
              }
            >
              {isCurrent ? ICONS[step] : done ? "✓" : index + 1}
            </span>
            <span className="tracker-label">{LABELS[step]}</span>
            {!compact && (
              <span
                className="hint"
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  fontWeight: isCurrent ? 800 : 400,
                  color: isCurrent ? "var(--primary-dark)" : isFuture ? "var(--muted)" : "var(--success)",
                }}
              >
                {isCurrent ? "● You are here" : HINTS[step]}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default OrderTracker;
