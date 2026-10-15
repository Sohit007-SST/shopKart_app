import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage, registerCustomer } from "../services/api.js";
import { validateRegister } from "../utils/validation.js";

const EMPTY_FORM = { fullName: "", email: "", password: "", phone: "" };

const SPLIT_STYLE = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
  gap: "0",
  width: "100%",
  maxWidth: "920px",
  border: "2px solid var(--ink)",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "var(--shadow-sticker)",
  background: "var(--surface)",
};

const SIDE_STYLE = {
  background:
    "radial-gradient(420px 220px at 85% 10%, rgba(226, 168, 28, 0.28), transparent 70%), radial-gradient(480px 260px at 10% 95%, rgba(224, 104, 47, 0.35), transparent 70%), var(--espresso)",
  color: "#f6f1e8",
  padding: "36px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
};

// API unchanged: validateRegister(form) then
// registerCustomer({ fullName, email, password, phone }) -> navigate("/login").
// Only the staging changed: editorial side panel + live password hint.
function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate("/login", { replace: true, state: { registeredEmail: form.email.trim() } });
    } catch (error) {
      setServerError(getErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordOk = form.password.length >= 6;

  return (
    <section className="auth-page" aria-label="Create account">
      <div style={SPLIT_STYLE} className="auth-split">
        <aside style={SIDE_STYLE} aria-label="Join ShopKart">
          <p className="eyebrow">Join ShopKart</p>
          <h2 style={{ color: "#fbf4e6", fontSize: "clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem)" }}>
            One account. <em style={{ color: "var(--mustard)" }}>Every shelf.</em>
          </h2>
          <p style={{ color: "#d8cdbd", margin: 0 }}>
            Join ShopKart to save favourites, fill your cart and track orders.
          </p>
          <ol style={{ padding: "0", margin: "14px 0 0", display: "grid", gap: "8px", fontSize: "0.92rem", listStyle: "none" }}>
            <li>① Tell us who you are — 30 seconds</li>
            <li>② Log in with your new account</li>
            <li>③ Shop, save, track — done</li>
          </ol>
        </aside>

        <div className="auth-card" style={{ border: "none", borderRadius: 0, boxShadow: "none", maxWidth: "none" }}>
          <h1>Create your account</h1>
          <p className="muted">Thirty seconds now, faster checkouts forever.</p>

          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Your full name"
                className={errors.fullName ? "has-error" : ""}
              />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>

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
                className={errors.email ? "has-error" : ""}
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className={errors.password ? "has-error" : ""}
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
              {errors.password ? (
                <p className="field-error">{errors.password}</p>
              ) : (
                <p className="hint">
                  {form.password
                    ? passwordOk
                      ? "✓ Looking good — that will do nicely."
                      : `${6 - form.password.length} more character${6 - form.password.length === 1 ? "" : "s"} to go…`
                    : "At least 6 characters."}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={errors.phone ? "has-error" : ""}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Register;
