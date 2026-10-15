import { Link } from "react-router-dom";
import StateMessage from "../components/StateMessage.jsx";

function NotFound() {
  return (
    <section aria-label="Page not found" style={{ textAlign: "center" }}>
      <div
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(4rem, 12vw, 7rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "var(--ink)",
        }}
      >
        4<span style={{ color: "var(--primary)" }}>0</span>4
      </div>
      <p className="eyebrow" style={{ marginBottom: "6px" }}>
        Lost in the aisles?
      </p>
      <StateMessage icon="🧭" title="Page not found" text="The page you are looking for doesn't exist — but the shelves are still full.">
        <Link to="/home" className="btn btn-primary">
          Go Home
        </Link>
        <Link to="/products" className="btn btn-outline">
          Browse Products
        </Link>
      </StateMessage>
    </section>
  );
}

export default NotFound;
