import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice, handleImageError } from "../utils/format.js";
import { DUR, EASE } from "./motion/tokens.js";

const stepperButtonStyle = {
  width: "38px",
  height: "36px",
  display: "grid",
  placeItems: "center",
  fontSize: "1.25rem",
  fontWeight: 900,
  lineHeight: 1,
  color: "var(--ink)",
};

const stepperCountStyle = {
  minWidth: "44px",
  textAlign: "center",
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  fontSize: "1.02rem",
};

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, isPending } = useCart();
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();
  const { product, quantity } = item;
  const pending = isPending(product._id);
  const overStock = quantity > product.stock;
  const lowStock = !overStock && product.stock > 0 && product.stock <= 5;

  const run = async (action) => {
    setError("");
    const result = await action();
    if (!result.ok) setError(result.message);
  };

  // Plain div under prefers-reduced-motion; otherwise a restrained
  // fade/rise line that also animates out via the parent AnimatePresence.
  const Root = reduceMotion ? "div" : motion.div;
  const rootMotionProps = reduceMotion
    ? {}
    : {
        layout: true,
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8, transition: { duration: DUR.micro, ease: EASE } },
        transition: { duration: DUR.card, ease: EASE },
      };

  // Pointer-driven tap springs on the stepper; transform-only, off under reduced motion.
  const StepperButton = reduceMotion ? "button" : motion.button;
  const stepperMotionProps = reduceMotion
    ? {}
    : {
        whileTap: { scale: 0.86 },
        whileHover: { scale: 1.1 },
        transition: { duration: DUR.micro, ease: EASE },
      };

  return (
    <Root className="cart-item" {...rootMotionProps} style={{ opacity: pending ? 0.65 : 1 }}>
      <Link to={`/products/${product._id}`} className="cart-item-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={handleImageError}
        />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`} className="cart-item-name">
          {product.name}
        </Link>
        <p className="muted">{formatPrice(product.price)} each</p>
        {lowStock && (
          <p className="hint" style={{ color: "var(--warn)", fontWeight: 700 }}>
            Only {product.stock} left — order soon.
          </p>
        )}

        <div className="qty-row">
          <span className="muted" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
            Qty
          </span>
          <div className="qty-control" aria-busy={pending}>
            <StepperButton
              type="button"
              style={stepperButtonStyle}
              aria-label="Decrease quantity"
              title="Decrease quantity"
              onClick={() => run(() => updateQuantity(product._id, quantity - 1))}
              disabled={pending || quantity <= 1}
              {...stepperMotionProps}
            >
              −
            </StepperButton>
            <span style={stepperCountStyle} aria-live="polite" aria-atomic="true" aria-label={`Quantity ${quantity}`}>
              {quantity}
            </span>
            <StepperButton
              type="button"
              style={stepperButtonStyle}
              aria-label="Increase quantity"
              title="Increase quantity"
              onClick={() => run(() => updateQuantity(product._id, quantity + 1))}
              disabled={pending || quantity >= product.stock}
              {...stepperMotionProps}
            >
              +
            </StepperButton>
          </div>
          <button type="button" className="link-button" onClick={() => run(() => removeFromCart(product._id))} disabled={pending}>
            {pending ? "Updating..." : "Remove"}
          </button>
        </div>

        {overStock && (
          <p className="field-error" role="alert">
            {product.stock === 0
              ? "This product is now out of stock. Please remove it."
              : `Only ${product.stock} left now - please reduce the quantity.`}
          </p>
        )}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="cart-item-total" aria-live="polite" aria-atomic="true">
        {formatPrice(product.price * quantity)}
      </div>
    </Root>
  );
}

export default CartItem;
