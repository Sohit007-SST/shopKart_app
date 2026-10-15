import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";

function AddToCartButton({ product, className = "" }) {
  const { addToCart, isPending, quantityOf } = useCart();
  const [message, setMessage] = useState({ text: "", ok: true });

  const pending = isPending(product._id);
  const inCart = quantityOf(product._id);
  const outOfStock = product.stock === 0;
  const reachedLimit = inCart >= product.stock;

  const handleAdd = async () => {
    setMessage({ text: "", ok: true });
    const result = await addToCart(product._id);
    setMessage({ text: result.ok ? "Added to cart" : result.message, ok: result.ok });
  };

  let label = "Add to Cart";
  if (outOfStock) label = "Out of Stock";
  else if (pending) label = "Adding...";
  else if (reachedLimit) label = "Max stock in cart";
  else if (inCart) label = `Add Another (${inCart} in cart)`;

  const disabled = outOfStock || pending || reachedLimit;
  const accent =
    outOfStock || reachedLimit
      ? { bg: "#e0d2b6", fg: "#6f6152" }
      : pending
        ? { bg: "#e2a81c", fg: "#1c120d" }
        : { bg: "#c8502e", fg: "#fffdf6" };

  return (
    <div className="cart-action" style={{ width: "100%" }}>
      <button
        type="button"
        className={`btn btn-primary ${className}`}
        onClick={handleAdd}
        disabled={disabled}
        aria-busy={pending}
        aria-live="off"
        title={inCart ? `${inCart} already in your cart` : label}
        style={{
          width: "100%",
          background: accent.bg,
          borderColor: "#201410",
          color: accent.fg,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled && !pending ? 0.75 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span aria-hidden="true">{pending ? "◌" : outOfStock ? "✕" : "🛒"}</span>
        {label}
      </button>
      <p
        aria-live="polite"
        aria-hidden={message.text ? undefined : true}
        className={message.ok ? "field-success" : "field-error"}
        style={{
          minHeight: "1.4em",
          margin: "4px 0 0",
          fontSize: ".78rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {message.text ? `${message.ok ? "✓ " : "⚠ "}${message.text}` : ""}
      </p>
    </div>
  );
}

export default AddToCartButton;
