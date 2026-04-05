function validateSignupPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") return ["Invalid signup payload."];

  const fullName = String(payload.fullName || payload.name || "").trim();
  if (!fullName) errors.push("fullName is required");

  const email = String(payload.email || "").trim();
  if (!email) errors.push("email is required");
  else if (!email.includes("@")) errors.push("email is invalid");

  const password = String(payload.password || "").trim();
  if (!password) errors.push("password is required");
  else if (password.length < 6) errors.push("password must be at least 6 characters");

  return errors;
}

module.exports = { validateSignupPayload };

