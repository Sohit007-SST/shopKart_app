import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice, handleImageError, stockLabel } from "../utils/format.js";
import { DUR, EASE } from "./motion/tokens.js";

// Image-first card matching ProductCard: fixed-ratio image (no layout shift),
// one trust signal (stock line). No zoom-on-hover by design.
function WishlistCard({ product, onRemove }) {
  const { addToCart, isPending } = useCart();
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });
  const reduceMotion = useReducedMotion();
  const stock = stockLabel(product.stock);
  const pending = isPending(product._id);

  const handleRemove = async () => {
    setRemoving(true);
    setMessage({ text: "", ok: true });
    const result = await onRemove(product._id);
    if (!result.ok) {
      setMessage({ text: result.message, ok: false });
      setRemoving(false);
    }
  };

  // "Move to cart" = add one unit to the cart, then take it off the wishlist
  const handleMoveToCart = async () => {
    setMessage({ text: "", ok: true });
    const added = await addToCart(product._id);
    if (!added.ok) {
      setMessage({ text: added.message, ok: false });
      return;
    }
    setRemoving(true);
    await onRemove(product._id);
  };

  return (
    <motion.article
      className="card product-card"
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: DUR.micro, ease: EASE } }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: DUR.card, ease: EASE }}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, var(--primary), var(--mustard))",
          zIndex: 1,
        }}
      />
      <Link
        to={`/products/${product._id}`}
        className="card-image"
        style={{ aspectRatio: "4 / 3", height: "auto" }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={handleImageError}
        />
        <span className="saved-heart" title="In your wishlist">
          ♥
        </span>
      </Link>

      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3 className="card-title">
          <Link to={`/products/${product._id}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.name}
          </Link>
        </h3>
        <p
          className="price"
          style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "1.25rem" }}
        >
          {formatPrice(product.price)}
        </p>
        <p className={`stock stock-${stock.tone}`}>{stock.text}</p>

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline btn-small">
            View Details
          </Link>
          <button type="button" className="btn btn-small btn-wish is-saved" onClick={handleRemove} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
        <motion.button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleMoveToCart}
          disabled={product.stock === 0 || removing || pending}
          whileTap={reduceMotion || product.stock === 0 || removing || pending ? undefined : { scale: 0.97 }}
          transition={{ duration: DUR.micro, ease: EASE }}
        >
          {product.stock === 0 ? "Out of Stock" : pending ? "Moving..." : "Move to Cart"}
        </motion.button>
        {message.text && <p className={message.ok ? "field-success" : "field-error"}>{message.text}</p>}
      </div>
    </motion.article>
  );
}

export default WishlistCard;
