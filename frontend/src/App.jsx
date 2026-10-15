import { Link, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Account from "./pages/Account.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import NotFound from "./pages/NotFound.jsx";

const ESPRESSO = "#2b2320";
const CREAM = "#f6f1e8";
const TERRACOTTA = "#c2563a";
const MUSTARD = "#d9a441";

const footLink = { color: "#d8cfc0", textDecoration: "none", fontSize: "0.9rem" };
const footHead = {
  margin: "0 0 10px",
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: MUSTARD,
};

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer
        className="footer"
        style={{
          background: ESPRESSO,
          color: CREAM,
          borderTop: `3px solid ${TERRACOTTA}`,
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            padding: "34px 20px 18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
              gap: "24px",
            }}
            className="footer-grid"
          >
            <div>
              <span style={{ fontWeight: 800, fontFamily: "Fraunces, Georgia, serif", fontSize: "1.25rem" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-grid",
                    placeItems: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: TERRACOTTA,
                    color: "#fff",
                    fontSize: "0.9rem",
                    marginRight: "9px",
                    verticalAlign: "-6px",
                  }}
                >
                  S
                </span>
                ShopKart
              </span>
              <p style={{ color: "#d8cfc0", fontSize: "0.9rem", maxWidth: "34ch", margin: "10px 0 0" }}>
                A small, curated shelf of everyday finds — picked with care, packed within a day.
              </p>
              <p style={{ margin: "12px 0 0" }}>
                <Link
                  to="/products"
                  className="btn btn-small btn-primary"
                  style={{ background: TERRACOTTA, borderRadius: "999px", textDecoration: "none" }}
                >
                  Browse the shelves →
                </Link>
              </p>
            </div>
            <nav aria-label="Shop">
              <p style={footHead}>Shop</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link to="/home" style={footLink}>
                  Home
                </Link>
                <Link to="/products" style={footLink}>
                  Products
                </Link>
                <Link to="/wishlist" style={footLink}>
                  Wishlist
                </Link>
                <Link to="/cart" style={footLink}>
                  Cart
                </Link>
              </div>
            </nav>
            <nav aria-label="Orders">
              <p style={footHead}>Orders</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Link to="/orders" style={footLink}>
                  My Orders
                </Link>
                <Link to="/checkout" style={footLink}>
                  Checkout
                </Link>
                <Link to="/account" style={footLink}>
                  Account
                </Link>
              </div>
            </nav>
            <div>
              <p style={footHead}>Good to know</p>
              <p style={{ color: "#d8cfc0", fontSize: "0.88rem", margin: "0 0 6px" }}>
                Fast dispatch · Secure checkout · Easy 7-day returns
              </p>
              <p style={{ color: "#a89a87", fontSize: "0.82rem", margin: 0 }}>
                College lab project · Payments run in Razorpay Test Mode
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: "24px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(246,241,232,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
              fontSize: "0.82rem",
              color: "#a89a87",
            }}
          >
            <span>ShopKart · The Autumn Edit</span>
            <span>
              Made for browsing —{" "}
              <Link to="/products" style={{ color: CREAM }}>
                start with what&apos;s new
              </Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
