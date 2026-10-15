import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage, loginCustomer } from "../services/api.js";

const SPLIT_STYLE = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
  gap: "0",
  width: "100%",
  maxWidth: "880px",
  border: "2px solid var(--ink)",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "var(--shadow-sticker)",
  background: "var(--surface)",
};

const SIDE_STYLE = {
  background:
    "radial-gradient(420px 220px at 85% 10%, rgba(224, 104, 47, 0.4), transparent 70%), var(--espresso)",
  color: "#f6f1e8",
  padding: "36px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
};

// API unchanged: loginCustomer({ email, password }) -> refreshUser() -> navigate().
// Only the staging changed: an editorial side panel + show/hide password.
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const registeredEmail = location.state?.registeredEmail || "";
  const [form, setForm] = useState({ email: registeredEmail, password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      // The server sets the HttpOnly cookie - we never see or store the token
      await loginCustomer({ email: form.email.trim(), password: form.password });
      await refreshUser();
      navigate(location.state?.from || "/home", { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? "Invalid Credentials" : getErrorMessage(err, "Login failed."));
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page" aria-label="Login">
      <div style={SPLIT_STYLE} className="auth-split">
        <aside style={SIDE_STYLE} aria-label="Why ShopKart">
          <p className="eyebrow">ShopKart account</p>
          <h2 style={{ color: "#fbf4e6", fontSize: "clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem)" }}>
            Good carts. <em style={{ color: "var(--mustard)" }}>Warm shelves.</em> Fast dispatch.
          </h2>
          <p style={{ color: "#d8cdbd", margin: 0 }}>
            Log in to sync your wishlist, cart and parcel tracking across every visit.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: "8px", fontSize: "0.92rem" }}>
            <li>📦 Live order tracking, dot by dot</li>
            <li>❤️ A wishlist that waits for you</li>
            <li>⚡ Checkout in a couple of taps</li>
          </ul>
        </aside>

        <div className="auth-card" style={{ border: "none", borderRadius: 0, boxShadow: "none", maxWidth: "none" }}>
          <h1>Welcome back</h1>
          <p className="muted">Log in to continue shopping on ShopKart.</p>

          {registeredEmail && !error && (
            <div className="alert alert-success" role="status">
              ✓ Account created! Please log in.
            </div>
          )}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  style={{ paddingRight: "64px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--primary-dark)",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Logging in..." : "Login →"}
            </button>
          </form>

          <p className="auth-switch">
            New to ShopKart? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
