import { useEffect, useState } from "react";
import { toggleWishlist } from "../services/api.js";

// Single toggle button used on product cards and the product details page.
// States: default -> saving -> added/remove, with a visible error on failure.
function WishlistButton({ productId, saved, onChange }) {
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!justAdded) return undefined;
    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleClick = async () => {
    if (saving) return; // prevent duplicate requests
    setSaving(true);
    setError("");
    try {
      const data = await toggleWishlist(productId);
      onChange(productId, data.saved);
      setJustAdded(data.saved);
      window.dispatchEvent(new Event("wishlist:changed"));
    } catch {
      setError("Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  let label = "♡ Wishlist";
  if (saving) label = "⏳ Saving...";
  else if (justAdded) label = "♥ Saved!";
  else if (saved) label = "♥ Saved";

  return (
    <div className="wishlist-action">
      <button
        type="button"
        className={`btn btn-small btn-wish ${saved ? "is-saved" : ""}`}
        onClick={handleClick}
        disabled={saving}
        aria-pressed={saved}
        aria-busy={saving}
        title={saved ? "Remove from wishlist" : "Add to wishlist"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          fontWeight: 800,
          background: saved || justAdded ? "#1c120d" : "#fffdf6",
          color: saved || justAdded ? "#e2a81c" : "#201410",
          border: "2px solid #201410",
          boxShadow: saved || justAdded ? "2px 2px 0 rgba(200,80,46,.9)" : "2px 2px 0 rgba(32,20,16,.9)",
          transform: justAdded ? "scale(1.06) rotate(-1deg)" : "none",
          transition: "transform .18s ease, background .18s ease",
          cursor: saving ? "wait" : "pointer",
        }}
      >
        {label}
      </button>
      {error && (
        <p className="field-error" role="alert" style={{ margin: "4px 0 0", fontSize: ".78rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default WishlistButton;
