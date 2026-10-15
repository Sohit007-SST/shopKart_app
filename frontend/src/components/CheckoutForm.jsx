const FIELDS = [
  { name: "fullName", label: "Full Name", autoComplete: "name", placeholder: "e.g. Asha Sharma" },
  { name: "phone", label: "Phone", autoComplete: "tel", inputMode: "numeric", maxLength: 10, placeholder: "10-digit mobile number" },
  { name: "addressLine1", label: "Address", autoComplete: "street-address", placeholder: "Flat, street, landmark" },
  { name: "city", label: "City", autoComplete: "address-level2", placeholder: "e.g. Pune" },
  { name: "state", label: "State", autoComplete: "address-level1", placeholder: "e.g. Maharashtra" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", inputMode: "numeric", maxLength: 6, placeholder: "6-digit pincode" },
];

// Controlled form - the state lives in the Checkout page.
// Error states are announced: each invalid input gets aria-invalid +
// aria-describedby pointing at its message, and the message uses role="alert".
function CheckoutForm({ values, errors, onChange, disabled }) {
  return (
    <fieldset className="form-grid" disabled={disabled}>
      {FIELDS.map(({ name, label, ...inputProps }) => {
        const error = errors[name];
        const errorId = `${name}-error`;
        return (
          <div key={name} className={`form-field ${name === "addressLine1" ? "span-2" : ""}`}>
            <label htmlFor={name}>
              {label} <span aria-hidden="true" title="required">*</span>
            </label>
            <input
              id={name}
              name={name}
              value={values[name]}
              onChange={onChange}
              required
              className={error ? "has-error" : ""}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              {...inputProps}
            />
            {error && (
              <p className="field-error" id={errorId} role="alert">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

export default CheckoutForm;
