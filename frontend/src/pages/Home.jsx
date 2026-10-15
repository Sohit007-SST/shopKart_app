import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";
import { Reveal } from "../components/motion/Reveal.jsx";
import { Stagger, StaggerItem } from "../components/motion/Stagger.jsx";

const INK = "#2b2320";
const CREAM = "#f6f1e8";
const TERRACOTTA = "#c2563a";
const MUSTARD = "#d9a441";
const LINE = "#e4dccf";
const SURFACE = "#fffdf8";

const railLinks = [
  { to: "/products", icon: "🛍️", title: "Browse Products", text: "Search and filter the catalogue" },
  { to: "/wishlist", icon: "♥", title: "My Wishlist", text: "Things you saved for later" },
  { to: "/orders", icon: "📦", title: "My Orders", text: "Track what you bought" },
];

const categories = [
  { to: "/products", tag: "Everyday", title: "Daily essentials", text: "Restock the staples you reach for most." },
  { to: "/products", tag: "Gifting", title: "Thoughtful gifts", text: "Small finds worth wrapping up." },
  { to: "/products", tag: "New in", title: "Fresh arrivals", text: "The latest additions to the shelves." },
];

const trust = [
  { icon: "🚚", title: "Fast dispatch", text: "Orders packed within 24 hours" },
  { icon: "🔒", title: "Secure checkout", text: "Razorpay Test Mode protected" },
  { icon: "↩️", title: "Easy returns", text: "No-fuss returns within 7 days" },
];

const testimonials = [
  {
    quote: "Ordered in the morning, packed by evening. The little handwritten note made my day.",
    name: "Ananya S.",
    detail: "Verified buyer · Essentials haul",
  },
  {
    quote: "The wishlist saved me twice — everything I hovered over was still there at checkout.",
    name: "Rohan M.",
    detail: "Verified buyer · Gifts",
  },
  {
    quote: "Clean catalogue, honest prices, zero fuss at returns. My default corner shop now.",
    name: "Priya K.",
    detail: "Verified buyer · Fresh arrivals",
  },
];

const marqueeItems = [
  "Fast dispatch within 24 hours",
  "Secure Razorpay Test Mode checkout",
  "Easy 7-day returns",
  "Curated shelves, honest prices",
  "Wishlist it · Love it later",
];

const ACCENTS = [TERRACOTTA, MUSTARD, "#6b7c4e"];

function Home() {
  const { user } = useAuth();
  const { itemCount, subtotal } = useCart();

  const firstName = user?.fullName?.split(" ")[0] || "friend";
  const marqueeRow = [...marqueeItems, ...marqueeItems];

  return (
    <section
      aria-label="Home magazine"
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      <style>{`@keyframes shopkart-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* Editorial magazine hero — oversized serif + layered shapes */}
      <Reveal>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: INK,
            color: CREAM,
            borderRadius: "24px",
            padding: "clamp(28px, 4.5vw, 52px)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)",
            gap: "32px",
            alignItems: "center",
          }}
        >
          {/* Layered imagery shapes (pure CSS, decorative) */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div
              style={{
                position: "absolute",
                right: "-70px",
                top: "-90px",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #d96a45, #8f3a22 72%)",
                opacity: 0.85,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "170px",
                bottom: "-110px",
                width: "190px",
                height: "260px",
                borderRadius: "120px 120px 24px 24px",
                background: MUSTARD,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "60px",
                bottom: "26px",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: `2px dashed rgba(246,241,232,0.55)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "-40px",
                bottom: "-70px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                border: `1px solid rgba(246,241,232,0.14)`,
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "0.74rem",
                fontWeight: 800,
                margin: "0 0 14px",
                color: MUSTARD,
                background: "rgba(217,164,65,0.12)",
                border: "1px solid rgba(217,164,65,0.4)",
                borderRadius: "999px",
                padding: "6px 14px",
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: "7px", height: "7px", borderRadius: "50%", background: MUSTARD }}
              />
              The Autumn Edit · Issue 04
            </p>
            <h1
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontWeight: 900,
                fontSize: "clamp(2.6rem, 6vw, 4.4rem)",
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
                color: CREAM,
              }}
            >
              Good to see you, {firstName}.
              <br />
              Here&apos;s what&apos;s{" "}
              <em style={{ color: MUSTARD, fontStyle: "italic", fontWeight: 600 }}>worth a look</em>{" "}
              today.
            </h1>
            <p style={{ color: "#d8cdbd", margin: "0 0 24px", maxWidth: "46ch", fontSize: "1.02rem" }}>
              A short, curated shelf of the catalogue — your cart, wishlist, and orders are
              one tap away whenever you&apos;re ready.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link
                to="/products"
                className="btn btn-primary"
                style={{ background: TERRACOTTA, borderRadius: "999px", padding: "12px 26px" }}
              >
                Start Shopping →
              </Link>
              <Link
                to="/wishlist"
                className="btn"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(246,241,232,0.4)",
                  color: CREAM,
                  borderRadius: "999px",
                  padding: "12px 26px",
                  textDecoration: "none",
                }}
              >
                View Wishlist
              </Link>
            </div>
            <p style={{ color: "#a89a87", fontSize: "0.82rem", margin: "16px 0 0" }}>
              No queues, no noise — just the good shelf.
            </p>
          </div>

          {/* Layered collage: arch visual + sticker + shelf card */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              aria-hidden="true"
              style={{
                borderRadius: "140px 140px 18px 18px",
                background: `linear-gradient(160deg, ${CREAM} 0%, #efe2c8 55%, ${MUSTARD} 130%)`,
                border: `2px solid rgba(246,241,232,0.7)`,
                padding: "26px 22px 20px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontStyle: "italic",
                  color: TERRACOTTA,
                  fontSize: "4rem",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                S
              </p>
              <p
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: INK,
                  fontSize: "1.05rem",
                  margin: "6px 0 0",
                }}
              >
                the curated shelf
              </p>
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: INK,
                  color: CREAM,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  borderRadius: "999px",
                  padding: "5px 11px",
                  transform: "rotate(8deg)",
                }}
              >
                ★ 4.9 loved
              </span>
            </div>
            <aside
              aria-label="Your shelf at a glance"
              style={{
                background: SURFACE,
                color: INK,
                borderRadius: "16px",
                padding: "20px",
                border: `1px solid ${LINE}`,
              }}
            >
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: TERRACOTTA,
                  margin: "0 0 4px",
                }}
              >
                Featured · Your shelf
              </p>
              <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.25rem", margin: "0 0 4px" }}>
                {itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"} waiting` : "A fresh, empty basket"}
              </p>
              <p style={{ color: "#71665a", fontSize: "0.9rem", margin: "0 0 14px" }}>
                {itemCount ? `Subtotal ${formatPrice(subtotal)}` : "Browse the catalogue to fill it."}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Link
                  to="/cart"
                  className="btn btn-small btn-primary"
                  style={{ background: TERRACOTTA, borderRadius: "999px" }}
                >
                  My Cart ({itemCount})
                </Link>
                <Link
                  to="/orders"
                  className="btn btn-small btn-outline"
                  style={{ borderRadius: "999px" }}
                >
                  Orders
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Reveal>

      {/* Marquee strip */}
      <Reveal delay={0.05}>
        <div
          aria-hidden="true"
          style={{
            background: TERRACOTTA,
            color: CREAM,
            borderRadius: "999px",
            border: `2px solid ${INK}`,
            overflow: "hidden",
            padding: "10px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0",
              width: "max-content",
              animation: "shopkart-marquee 26s linear infinite",
            }}
          >
            {marqueeRow.map((m, i) => (
              <span
                key={`${m}-${i}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 18px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {m} <span style={{ color: MUSTARD }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Featured rail — editorial index, not icon cards */}
      <Reveal delay={0.05}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", margin: 0 }}>Featured this week</h2>
          <Link to="/products" style={{ color: TERRACOTTA, fontWeight: 600, fontSize: "0.9rem" }}>
            View all →
          </Link>
        </div>
        <Stagger
          style={{
            background: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {railLinks.map((l, i) => (
            <StaggerItem key={l.title}>
              <Link
                to={l.to}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "14px",
                  padding: "14px 18px",
                  textDecoration: "none",
                  color: INK,
                  borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontStyle: "italic",
                    color: TERRACOTTA,
                    fontSize: "0.95rem",
                    minWidth: "2ch",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: "0.98rem" }}>{l.title}</strong>
                  <span className="muted" style={{ fontSize: "0.86rem" }}>
                    {l.text}
                  </span>
                </span>
                <span aria-hidden="true" style={{ color: TERRACOTTA, fontWeight: 700 }}>
                  →
                </span>
              </Link>
            </StaggerItem>
          ))}
          <StaggerItem>
            <Link
              to="/cart"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "14px",
                padding: "14px 18px",
                textDecoration: "none",
                color: INK,
                borderTop: `1px solid ${LINE}`,
                background: "#faf5ea",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontStyle: "italic",
                  color: TERRACOTTA,
                  fontSize: "0.95rem",
                  minWidth: "2ch",
                }}
              >
                {String(railLinks.length + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: "0.98rem" }}>My Cart ({itemCount})</strong>
                <span className="muted" style={{ fontSize: "0.86rem" }}>
                  {itemCount ? `Subtotal ${formatPrice(subtotal)}` : "Your cart is empty"}
                </span>
              </span>
              <span aria-hidden="true" style={{ color: TERRACOTTA, fontWeight: 700 }}>
                →
              </span>
            </Link>
          </StaggerItem>
        </Stagger>
      </Reveal>

      {/* Category tiles — editorial feature well with top rules */}
      <Reveal delay={0.05}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "12px",
            margin: "4px 0 10px",
          }}
        >
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", margin: 0 }}>Shop by mood</h2>
          <Link to="/products" style={{ color: TERRACOTTA, fontWeight: 600, fontSize: "0.9rem" }}>
            All shelves →
          </Link>
        </div>
        <Stagger
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0",
            background: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {categories.map((c, i) => (
            <StaggerItem key={c.title}>
              <Link
                to={c.to}
                style={{
                  display: "block",
                  height: "100%",
                  padding: "18px",
                  textDecoration: "none",
                  color: INK,
                  borderTop: `3px solid ${ACCENTS[i % ACCENTS.length]}`,
                  borderLeft: i === 0 ? "none" : `1px solid ${LINE}`,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: TERRACOTTA,
                    background: "#fbeae5",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    marginBottom: "8px",
                  }}
                >
                  {c.tag}
                </span>
                <strong style={{ display: "block", fontFamily: "Fraunces, Georgia, serif", fontSize: "1.05rem" }}>
                  {c.title}
                </strong>
                <span className="muted" style={{ fontSize: "0.88rem" }}>
                  {c.text}
                </span>
                <span aria-hidden="true" style={{ display: "block", marginTop: "10px", color: TERRACOTTA, fontWeight: 700 }}>
                  Explore →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      {/* Testimonials */}
      <Reveal delay={0.05}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "12px",
            margin: "4px 0 10px",
          }}
        >
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", margin: 0 }}>Loved by regulars</h2>
          <Link to="/orders" style={{ color: TERRACOTTA, fontWeight: 600, fontSize: "0.9rem" }}>
            Your orders →
          </Link>
        </div>
        <Stagger
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure
                style={{
                  margin: 0,
                  height: "100%",
                  background: SURFACE,
                  border: `1px solid ${LINE}`,
                  borderRadius: "14px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <span aria-hidden="true" style={{ color: MUSTARD, letterSpacing: "2px" }}>
                  ★★★★★
                </span>
                <blockquote
                  style={{
                    margin: 0,
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: "1rem",
                    lineHeight: 1.45,
                  }}
                >
                  “{t.quote}”
                </blockquote>
                <figcaption className="muted" style={{ fontSize: "0.84rem", marginTop: "auto" }}>
                  <strong style={{ color: INK }}>{t.name}</strong> · {t.detail}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      {/* Trust band */}
      <Reveal delay={0.05}>
        <div
          aria-label="Why shop with us"
          style={{
            display: "flex",
            flexWrap: "wrap",
            background: INK,
            color: CREAM,
            borderRadius: "14px",
            border: `1px solid ${INK}`,
            padding: "6px 0",
          }}
        >
          {trust.map((t, i) => (
            <div
              key={t.title}
              style={{
                flex: "1 1 200px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "12px 18px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(246,241,232,0.18)",
              }}
            >
              <span style={{ fontSize: "1.15rem", lineHeight: 1.2 }} aria-hidden="true">
                {t.icon}
              </span>
              <div>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>{t.title}</strong>
                <span style={{ fontSize: "0.84rem", color: "#d8cfc0" }}>{t.text}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default Home;
