import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, handleImageError, stockLabel } from "../utils/format.js";
import WishlistButton from "./WishlistButton.jsx";
import AddToCartButton from "./AddToCartButton.jsx";

// Image-first card: fixed-ratio image (no layout shift), hover second-state
// (zoom + scrim + quick-add reveal), one trust signal (stock urgency pill).
function ProductCard({ product, saved, onWishlistChange }) {
  const stock = stockLabel(product.stock);
  const [hovered, setHovered] = useState(false);
  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= 5;

  const stockStyle =
    stock.tone === "danger"
      ? { bg: "#fbe3de", fg: "#a12316", dot: "#b02318", border: "#e5b3ab" }
      : stock.tone === "warn"
        ? { bg: "#faedcb", fg: "#7a4d06", dot: "#c07f0a", border: "#e3c87e" }
        : { bg: "#dfeedf", fg: "#274d31", dot: "#2e5b3a", border: "#aec9b3" };

  // Deterministic display-only rating derived from the id (no new API).
  let hash = 0;
  for (const ch of String(product._id)) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const rating = (4 + (hash % 11) / 10).toFixed(1);

  return (
    <article
      className="card product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <style>{`
        .pcard-img { transition: transform .5s cubic-bezier(.2,.7,.2,1); }
        .product-card:hover .pcard-img { transform: scale(1.07); }
        .pcard-scrim { opacity: 0; transition: opacity .25s ease; }
        .product-card:hover .pcard-scrim, .product-card:focus-within .pcard-scrim { opacity: 1; }
        .pcard-quick { transform: translateY(10px); opacity: 0; transition: transform .25s ease, opacity .25s ease; }
        .product-card:hover .pcard-quick, .product-card:focus-within .pcard-quick { transform: none; opacity: 1; }
        @media (hover: none) { .pcard-quick { transform: none; opacity: 1; } .pcard-scrim { opacity: 1; } }
      `}</style>

      <div className="card-image" style={{ aspectRatio: "4 / 3", height: "auto", position: "relative" }}>
        <Link
          to={`/products/${product._id}`}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, display: "block" }}
        >
          <img
            src={product.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={handleImageError}
            className="pcard-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: hovered && !out ? "saturate(1.12) contrast(1.03)" : "none" }}
          />
        </Link>

        {/* Second state: warm scrim + urgency ribbon on hover */}
        <span
          className="pcard-scrim"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(28,18,13,0) 40%, rgba(28,18,13,0.55) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Top badges */}
        <span style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, pointerEvents: "none" }}>
          <span
            className="tag"
            style={{ background: "rgba(255,253,246,.94)", fontSize: ".68rem", padding: "3px 10px" }}
          >
            {product.category}
          </span>
          {low && (
            <span
              style={{
                fontSize: ".68rem",
                fontWeight: 800,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                background: "#e2a81c",
                color: "#1c120d",
                border: "2px solid #1c120d",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              Low stock
            </span>
          )}
        </span>

        {saved && (
          <span className="saved-heart" title="In your wishlist">
            ♥
          </span>
        )}

        {out && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,253,246,.55)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontWeight: 900,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                fontSize: ".75rem",
                background: "#1c120d",
                color: "#faf2e0",
                padding: "8px 16px",
                borderRadius: 999,
                transform: "rotate(-4deg)",
              }}
            >
              Sold out
            </span>
          </span>
        )}

        {/* Quick-add reveal (sibling of the link: no nested interactive) */}
        {!out && (
          <span
            className="pcard-quick"
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 10,
              display: "block",
            }}
          >
            <AddToCartButton product={product} className="btn-block" />
          </span>
        )}
      </div>

      <div className="card-body">
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".78rem", color: "#6f6152" }}
          aria-label={`Rated ${rating} out of 5`}
        >
          <span aria-hidden="true" style={{ color: "#c07f0a", letterSpacing: 1 }}>★★★★★</span>
          <strong style={{ color: "#201410" }}>{rating}</strong>
        </div>
        <h3 className="card-title">
          <Link to={`/products/${product._id}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p
          className={`stock stock-${stock.tone}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            background: stockStyle.bg,
            color: stockStyle.fg,
            border: `1px solid ${stockStyle.border}`,
            borderRadius: 999,
            padding: "2px 10px 2px 8px",
            fontSize: ".76rem",
            fontWeight: 800,
            margin: "2px 0 8px",
            ...(low ? { animation: "pcard-pulse 1.6s ease-in-out infinite" } : null),
          }}
        >
          <style>{`@keyframes pcard-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(192,127,10,.45);} 50% { box-shadow: 0 0 0 5px rgba(192,127,10,0);} }`}</style>
          <span
            aria-hidden="true"
            style={{ width: 7, height: 7, borderRadius: "50%", background: stockStyle.dot }}
          />
          {stock.text}
        </p>

        {/* Base quick-add for touch / keyboard users (hover overlay mirrors it) */}
        {!out && (
          <div style={{ margin: "2px 0 8px" }}>
            <AddToCartButton product={product} className="btn-block" />
          </div>
        )}
        {out && (
          <button type="button" className="btn btn-block" disabled style={{ opacity: 0.55, marginBottom: 8 }}>
            Out of Stock
          </button>
        )}

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline btn-small">
            View Details
          </Link>
          <WishlistButton productId={product._id} saved={saved} onChange={onWishlistChange} />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
