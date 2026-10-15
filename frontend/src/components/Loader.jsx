import { useEffect, useState } from "react";

const TIPS = [
  "Polishing the shelves…",
  "Wrapping your parcels…",
  "Chasing the delivery van…",
  "Brewing fresh chai…",
];

// Same contract: { text }. Only the personality changed —
// a pulsing parcel plus a rotating shop-floor caption.
function Loader({ text = "Loading..." }) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTip((prev) => (prev + 1) % TIPS.length), 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="state-box" role="status" aria-live="polite">
      <div
        aria-hidden="true"
        style={{ fontSize: "2.2rem", animation: "pulseSoft 1.4s ease-in-out infinite" }}
      >
        📦
      </div>
      <div className="spinner" aria-hidden="true" />
      <p style={{ fontWeight: 700, color: "var(--ink)" }}>{text}</p>
      <p className="hint" aria-hidden="true" style={{ minHeight: "1.4em" }}>
        {TIPS[tip]}
      </p>
    </div>
  );
}

export default Loader;
