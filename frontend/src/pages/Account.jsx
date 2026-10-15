import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import { changePassword, getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";

// Same PATCH contract: changePassword({ oldPassword, newPassword }).
// Added show/hide toggles + a client-side strength meter (display only).
function passwordScore(value) {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

const SCORE_LABEL = ["Too weak", "Okay", "Good", "Strong", "Fort Knox"];
const SCORE_COLOR = ["var(--danger)", "var(--warn)", "var(--warn)", "var(--success)", "var(--success)"];

function PasswordField({ id, name, label, value, onChange, autoComplete, placeholder, show, onToggleShow }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          style={{ paddingRight: "64px" }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={show}
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
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState({ oldPassword: false, newPassword: false, confirm: false });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setStatus({ type: "", text: "" });
  };

  const toggle = (name) => setVisible((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.oldPassword || !form.newPassword) {
      return setStatus({ type: "error", text: "Please fill in both passwords." });
    }
    if (form.newPassword.length < 6) {
      return setStatus({ type: "error", text: "New password must be at least 6 characters." });
    }
    if (form.newPassword !== form.confirm) {
      return setStatus({ type: "error", text: "New passwords do not match." });
    }

    setSaving(true);
    try {
      const data = await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setStatus({ type: "success", text: data.message });
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      setStatus({ type: "error", text: getErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const score = passwordScore(form.newPassword);

  return (
    <form className="card panel" onSubmit={handleSubmit} noValidate aria-label="Change password">
      <h2>🔐 Change Password</h2>
      <p className="muted">Pick a new password at least 6 characters long.</p>
      {status.text && (
        <div className={`alert alert-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
          {status.type === "success" ? "✓ " : ""}{status.text}
        </div>
      )}
      <PasswordField
        id="oldPassword"
        name="oldPassword"
        label="Current password"
        value={form.oldPassword}
        onChange={handleChange}
        autoComplete="current-password"
        placeholder="Enter your current password"
        show={visible.oldPassword}
        onToggleShow={() => toggle("oldPassword")}
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="New password"
        value={form.newPassword}
        onChange={handleChange}
        autoComplete="new-password"
        placeholder="At least 6 characters"
        show={visible.newPassword}
        onToggleShow={() => toggle("newPassword")}
      />
      {form.newPassword && (
        <div style={{ margin: "-6px 0 14px" }} aria-live="polite">
          <div
            style={{
              height: "6px",
              borderRadius: "999px",
              background: "var(--line)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((score + 1) / 5) * 100}%`,
                background: SCORE_COLOR[score],
                borderRadius: "999px",
                transition: "width 0.2s ease, background 0.2s ease",
              }}
            />
          </div>
          <p className="hint">
            Strength: <strong style={{ color: SCORE_COLOR[score] }}>{SCORE_LABEL[score]}</strong>
          </p>
        </div>
      )}
      <PasswordField
        id="confirm"
        name="confirm"
        label="Confirm new password"
        value={form.confirm}
        onChange={handleChange}
        autoComplete="new-password"
        placeholder="Repeat the new password"
        show={visible.confirm}
        onToggleShow={() => toggle("confirm")}
      />
      {form.confirm && form.newPassword !== form.confirm && (
        <p className="field-error">New passwords do not match yet.</p>
      )}
      <button type="submit" className="btn btn-outline" disabled={saving}>
        {saving ? "Saving..." : "Update Password"}
      </button>
    </form>
  );
}

function Account() {
  const { user, checking, refreshUser } = useAuth();

  // Always show fresh profile data from GET /customers/me
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (checking || !user) return <Loader text="Loading your account..." />;

  const initial = (user.fullName || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <section aria-label="My account">
      <div className="page-head">
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div
            aria-hidden="true"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1.6rem",
              color: "#fff",
              background: "var(--primary)",
              border: "2px solid var(--ink)",
              boxShadow: "var(--shadow-sticker-sm)",
              transform: "rotate(-4deg)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div>
            <p className="eyebrow">Your ShopKart account</p>
            <h1>Namaste, {(user.fullName || "").split(" ")[0] || "shopper"}!</h1>
            <p className="muted">
              Profile details and password settings
              {user.createdAt && ` · with us since ${formatDate(user.createdAt)}`}
            </p>
          </div>
        </div>
        <Link to="/orders" className="btn btn-outline btn-small">
          My Orders
        </Link>
      </div>

      <div className="quick-links" style={{ marginBottom: "20px" }}>
        <Link to="/orders" className="card quick-link">
          <span className="quick-icon" aria-hidden="true">📦</span>
          <strong>My Orders</strong>
          <span className="muted">Track every parcel dot by dot</span>
        </Link>
        <Link to="/wishlist" className="card quick-link">
          <span className="quick-icon" aria-hidden="true">❤️</span>
          <strong>Wishlist</strong>
          <span className="muted">Everything you have your eye on</span>
        </Link>
      </div>

      <div className="home-grid">
        <div className="card panel">
          <h2>👤 My Profile</h2>
          <dl className="profile-list">
            <div>
              <dt>Name</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
            {user.createdAt && (
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            )}
          </dl>
          <p className="hint">Signed in with your ShopKart email and password.</p>
        </div>

        <ChangePasswordForm />
      </div>
    </section>
  );
}

export default Account;
