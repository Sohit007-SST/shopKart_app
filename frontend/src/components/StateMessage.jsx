// Used for empty and error states so no page ever shows a blank screen.
// Same contract: { icon, title, text, children, tone }.
const TONE_ACCENT = {
  neutral: "var(--primary)",
  error: "var(--danger)",
  success: "var(--success)",
};

const TONE_EYEBROW = {
  neutral: "ShopKart",
  error: "Something went wrong",
  success: "All good",
};

function StateMessage({ icon, title, text, children, tone = "neutral" }) {
  const role = tone === "error" ? "alert" : "status";
  const accent = TONE_ACCENT[tone] || TONE_ACCENT.neutral;

  return (
    <div className={`state-box state-${tone}`} role={role}>
      <p
        className="eyebrow"
        style={{ background: "var(--mustard)", marginBottom: "14px" }}
      >
        {TONE_EYEBROW[tone] || TONE_EYEBROW.neutral}
      </p>
      {icon && (
        <div
          className="state-icon"
          aria-hidden="true"
          style={{ animation: "pulseSoft 2.4s ease-in-out infinite" }}
        >
          {icon}
        </div>
      )}
      <h2
        style={
          tone === "error"
            ? undefined
            : { textWrap: "balance" }
        }
      >
        {title}
      </h2>
      {text && <p>{text}</p>}
      <div
        aria-hidden="true"
        style={{
          width: "72px",
          height: "4px",
          borderRadius: "999px",
          background: accent,
          margin: "14px auto 0",
          opacity: 0.85,
        }}
      />
      {children && <div className="state-actions">{children}</div>}
    </div>
  );
}

export default StateMessage;
