import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";
import { DUR, EASE } from "../components/motion/tokens.js";

// Free-shipping threshold matches the site copy ("Free shipping over ₹999").
const FREE_SHIPPING_THRESHOLD = 999;

const shipPanelStyle = {
  marginBottom: "16px",
  padding: "14px 18px 16px",
  background: "var(--surface)",
  border: "2px solid var(--ink)",
  borderRadius: "var(--radius)",
  boxShadow: "var(--shadow-sticker-sm)",
};

const shipTrackStyle = {
  height: "12px",
  borderRadius: "var(--pill)",
  background: "var(--bg-deep)",
  border: "2px solid var(--ink)",
  overflow: "hidden",
  marginTop: "10px",
};

const shipFillBaseStyle = {
  height: "100%",
  borderRadius: "var(--pill)",
  background: "linear-gradient(90deg, var(--mustard), var(--primary))",
};

const trustListStyle = {
  listStyle: "none",
  padding: 0,
  margin: "12px 0 0",
  display: "grid",
  gap: "4px",
  fontSize: "0.85rem",
  color: "var(--muted)",
};

function Cart() {
  const { cartItems, loading, loaded, error, itemCount, subtotal, refreshCart } = useCart();
  const reduceMotion = useReducedMotion();

  if (loading && !loaded) return <Loader text="Loading your cart..." />;

  if (error && !loaded) {
    return (
      <StateMessage icon="⚠️" tone="error" title="Unable to load your cart." text={error}>
        <button type="button" className="btn btn-primary" onClick={refreshCart}>
          Try Again
        </button>
      </StateMessage>
    );
  }

  if (cartItems.length === 0) {
    return (
      <StateMessage
        icon="🛒"
        title="Your cart is empty"
        text="Looks like you haven't added anything yet. Good news: the shelves are stocked, shipping is free over ₹999, and everything dispatches within 24 hours."
      >
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
        <Link to="/wishlist" className="btn btn-outline">
          View Wishlist
        </Link>
      </StateMessage>
    );
  }

  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const shipsFree = remaining === 0;

  // Plain aside under prefers-reduced-motion; otherwise a single restrained
  // fade/rise on mount. No scroll or layout animation here.
  const Summary = reduceMotion ? "aside" : motion.aside;
  const summaryMotionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DUR.card, ease: EASE },
      };

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My Cart</h1>
          <p className="muted">
            {itemCount} item{itemCount === 1 ? "" : "s"} · {formatPrice(subtotal)} so far
          </p>
        </div>
        <Link to="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>

      <div style={shipPanelStyle}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem" }} aria-live="polite" aria-atomic="true">
          {shipsFree ? (
            <>🎉 You&apos;ve unlocked FREE shipping!</>
          ) : (
            <>
              Add {formatPrice(remaining)} more for <strong>FREE shipping</strong>
            </>
          )}
        </p>
        <div
          style={shipTrackStyle}
          role="progressbar"
          aria-label="Progress towards free shipping"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          {reduceMotion ? (
            <div style={{ ...shipFillBaseStyle, width: `${progress * 100}%` }} />
          ) : (
            <motion.div
              style={shipFillBaseStyle}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: DUR.card, ease: EASE }}
            />
          )}
        </div>
        <p className="hint">Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
      </div>

      <div className="two-col">
        <div className="card cart-list">
          <AnimatePresence initial={false}>
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        <Summary className="summary" {...summaryMotionProps}>
          <h2>Order Summary</h2>
          <ul className="summary-lines">
            <li className="summary-row">
              <span>Items</span>
              <span>{itemCount}</span>
            </li>
            <li className="summary-row small">
              <span>Shipping</span>
              <span>{shipsFree ? "FREE 🎉" : "Calculated at checkout"}</span>
            </li>
          </ul>
          <div className="summary-total">
            <span>Subtotal</span>
            <span aria-live="polite" aria-atomic="true">
              {formatPrice(subtotal)}
            </span>
          </div>
          {hasStockProblem && <p className="field-error">Fix the stock issues in your cart before checkout.</p>}
          {hasStockProblem ? (
            <button type="button" className="btn btn-primary btn-block" disabled>
              Proceed to Checkout
            </button>
          ) : (
            <Link to="/checkout" className="btn btn-primary btn-block">
              Proceed to Checkout
            </Link>
          )}
          <p className="hint center">Prices are re-checked when you place the order.</p>
          <ul style={trustListStyle}>
            <li>🔒 Secure checkout</li>
            <li>🚚 Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)} · dispatched in 24h</li>
            <li>↩ Easy 7-day returns</li>
          </ul>
        </Summary>
      </div>
    </section>
  );
}

export default Cart;
