import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { fetchWishlist } from "../services/api.js";

const ESPRESSO = "#2b2320";
const CREAM = "#f6f1e8";
const TERRACOTTA = "#c2563a";
const MUSTARD = "#d9a441";

const linkBase = {
  padding: "7px 14px",
  borderRadius: "999px",
  color: CREAM,
  textDecoration: "none",
  fontWeight: 500,
  fontSize: "0.92rem",
  whiteSpace: "nowrap",
  position: "relative",
  isolation: "isolate",
  overflow: "hidden",
};

const linkInactive = { ...linkBase, background: "transparent" };

const activeWash = {
  position: "absolute",
  inset: 0,
  borderRadius: "999px",
  background: TERRACOTTA,
  boxShadow: `inset 0 -3px 0 ${MUSTARD}`,
  zIndex: 0,
};

const labelRow = {
  position: "relative",
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
};

const countBadge = {
  display: "inline-grid",
  placeItems: "center",
  minWidth: "22px",
  height: "22px",
  padding: "0 6px",
  marginLeft: "6px",
  borderRadius: "999px",
  background: "#4a3f38",
  color: CREAM,
  fontSize: "0.75rem",
  fontWeight: 700,
  verticalAlign: "1px",
};

const countBadgeActive = {
  ...countBadge,
  background: "#ffffff",
  color: TERRACOTTA,
};

/* Animated label: sliding active wash (shared layout) + popping count badge. */
function PillLabel({ isActive, layoutId, children, badge, badgeActive }) {
  return (
    <span style={labelRow}>
      {isActive && (
        <motion.span
          layoutId={layoutId}
          aria-hidden="true"
          style={activeWash}
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
        />
      )}
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center" }}>
        {children}
        {typeof badge === "number" && (
          <motion.span
            key={`${layoutId}-${badge}`}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
            style={badgeActive ? countBadgeActive : countBadge}
          >
            {badge}
          </motion.span>
        )}
      </span>
    </span>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px)");
    const onChange = (event) => setIsMobile(event.matches);
    setIsMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Wishlist count comes from the backend (not global state). It is refreshed
  // on navigation and whenever a component announces a wishlist change.
  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    const loadCount = () =>
      fetchWishlist()
        .then((data) => active && setWishlistCount(data.count))
        .catch(() => {});

    loadCount();
    window.addEventListener("wishlist:changed", loadCount);
    return () => {
      active = false;
      window.removeEventListener("wishlist:changed", loadCount);
    };
  }, [user, location.pathname]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    navigate("/login", { replace: true });
  };

  // Built only when a user exists: JSX props evaluate at creation, so an
  // unconditional element would read user.email while logged out and crash.
  const authLinks = !user ? null : (
    <>
      <NavLink to="/home" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel isActive={isActive} layoutId="nav-pill-main">
            Home
          </PillLabel>
        )}
      </NavLink>
      <NavLink to="/products" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel isActive={isActive} layoutId="nav-pill-main">
            Products
          </PillLabel>
        )}
      </NavLink>
      <NavLink to="/wishlist" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel
            isActive={isActive}
            layoutId="nav-pill-main"
            badge={wishlistCount}
            badgeActive={isActive}
          >
            Wishlist
          </PillLabel>
        )}
      </NavLink>
      <NavLink to="/cart" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel isActive={isActive} layoutId="nav-pill-main" badge={itemCount} badgeActive={isActive}>
            Cart
          </PillLabel>
        )}
      </NavLink>
      <NavLink to="/orders" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel isActive={isActive} layoutId="nav-pill-main">
            Orders
          </PillLabel>
        )}
      </NavLink>
      <NavLink to="/account" style={() => linkInactive}>
        {({ isActive }) => (
          <PillLabel isActive={isActive} layoutId="nav-pill-main">
            Account
          </PillLabel>
        )}
      </NavLink>
      <Link
        to="/account"
        className="nav-user nav-user-link"
        title={user.email}
        style={{ color: "#d8cfc0" }}
      >
        Hi, {(user.fullName || "").split(" ")[0] || "shopper"}
      </Link>
      <button
        type="button"
        className="btn btn-small"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          background: "transparent",
          border: `1px solid rgba(246,241,232,0.4)`,
          color: CREAM,
          borderRadius: "999px",
          padding: "6px 14px",
          cursor: loggingOut ? "not-allowed" : "pointer",
          opacity: loggingOut ? 0.6 : 1,
        }}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        className="navbar"
        animate={{ y: 0, opacity: 1 }}
        initial={{ y: -18, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          background: ESPRESSO,
          borderBottom: `3px solid ${TERRACOTTA}`,
          boxShadow: scrolled
            ? "0 12px 32px -12px rgba(33, 26, 22, 0.85)"
            : "0 6px 24px -12px rgba(33, 26, 22, 0.7)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="navbar-inner">
          <Link
            to={user ? "/home" : "/login"}
            className="brand"
            style={{ color: CREAM, textDecoration: "none" }}
          >
            <motion.span
              className="brand-mark"
              style={{ background: TERRACOTTA, color: "#fff" }}
              aria-hidden="true"
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              S
            </motion.span>
            ShopKart
          </Link>

          {user && (
            <>
              {isMobile && (
                <button
                  type="button"
                  className="menu-toggle"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <motion.span
                    key={menuOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    aria-hidden="true"
                  >
                    {menuOpen ? "✕" : "☰"}
                  </motion.span>
                </button>
              )}

              {!isMobile && (
                <nav className="nav-links" aria-label="Primary">
                  {authLinks}
                </nav>
              )}

              <AnimatePresence>
                {isMobile && menuOpen && (
                  <motion.nav
                    className="nav-links open"
                    aria-label="Primary"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {authLinks}
                  </motion.nav>
                )}
              </AnimatePresence>
            </>
          )}

          {!user && (
            <nav className="nav-links nav-links-guest" aria-label="Guest">
              <NavLink to="/login" style={() => linkInactive}>
                {({ isActive }) => (
                  <PillLabel isActive={isActive} layoutId="nav-pill-guest">
                    Login
                  </PillLabel>
                )}
              </NavLink>
              <NavLink to="/register" style={() => linkInactive}>
                {({ isActive }) => (
                  <PillLabel isActive={isActive} layoutId="nav-pill-guest">
                    Register
                  </PillLabel>
                )}
              </NavLink>
            </nav>
          )}
        </div>
      </motion.header>
    </MotionConfig>
  );
}

export default Navbar;
