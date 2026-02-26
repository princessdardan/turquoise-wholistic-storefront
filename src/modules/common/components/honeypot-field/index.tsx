/**
 * Honeypot field for bot detection.
 * Hidden via CSS positioning (not display:none, which bots detect).
 * If a bot fills this field, the form submission will be rejected.
 */
const HoneypotField = () => {
  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: 0,
        height: 0,
        overflow: "hidden",
      }}
    >
      <label htmlFor="website_url">Website</label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}

export default HoneypotField
