import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WishlistCard from "../components/WishlistCard.jsx";
import Loader from "../components/Loader.jsx";
import StateMessage from "../components/StateMessage.jsx";
import { PageFade } from "../components/motion/PageFade.jsx";
import { Stagger, StaggerItem } from "../components/motion/Stagger.jsx";
import { fetchWishlist, getErrorMessage, removeFromWishlist } from "../services/api.js";
import { formatPrice } from "../utils/format.js";

const eyebrowStyle = {
  margin: "0 0 6px",
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--primary-dark)",
};

const countPillStyle = {
  display: "inline-block",
  marginLeft: "8px",
  padding: "2px 12px",
  borderRadius: "var(--pill)",
  background: "var(--mustard-soft)",
  border: "2px solid var(--ink)",
  boxShadow: "2px 2px 0 rgba(32, 20, 16, 0.9)",
  fontFamily: "var(--font-body)",
  fontSize: "0.8rem",
  fontWeight: 800,
  verticalAlign: "middle",
};

const galleryNoteStyle = {
  margin: "-4px 0 18px",
  fontSize: "0.95rem",
  fontStyle: "italic",
  fontFamily: "var(--font-display)",
  color: "var(--muted)",
};

// Wishlist data lives in MongoDB and is fetched here - no global state needed (Lab 04)
function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWishlist();
      setItems(data.wishlist);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((product) => product._id !== productId));
      window.dispatchEvent(new Event("wishlist:changed"));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err, "Could not remove product.") };
    }
  };

  if (loading) return <Loader text="Loading your wishlist..." />;

  if (error) {
    return (
      <StateMessage icon="⚠️" tone="error" title="Something went wrong." text="We couldn't load your wishlist.">
        <button type="button" className="btn btn-primary" onClick={loadWishlist}>
          Try Again
        </button>
      </StateMessage>
    );
  }

  if (items.length === 0) {
    return (
      <StateMessage
        icon="❤️"
        title="Your wishlist is empty"
        text="Every great shelf starts with a single favourite. Tap the heart on anything you love and it will wait for you here — plus free shipping over ₹999 and dispatch in 24h when you're ready."
      >
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
        <Link to="/cart" className="btn btn-outline">
          View Cart
        </Link>
      </StateMessage>
    );
  }

  const savedTotal = items.reduce((sum, product) => sum + (product.price || 0), 0);

  return (
    <PageFade>
      <section>
        <div className="page-head">
          <div>
            <p style={eyebrowStyle}>♥ Saved things gallery</p>
            <h1>
              My Wishlist
              <span style={countPillStyle}>
                {items.length} saved
              </span>
            </h1>
            <p className="muted">
              {items.length} product{items.length === 1 ? "" : "s"} saved · worth {formatPrice(savedTotal)} in
              total
            </p>
          </div>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
        <p style={galleryNoteStyle}>Your personal shelf — everything you loved, waiting patiently.</p>

        <Stagger className="product-grid" stagger={0.05}>
          {items.map((product) => (
            <StaggerItem key={product._id} y={14}>
              <WishlistCard product={product} onRemove={handleRemove} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageFade>
  );
}

export default Wishlist;
