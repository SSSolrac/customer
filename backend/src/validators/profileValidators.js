function validateProfilePayload(payload) {
  if (!payload || typeof payload !== "object") return ["Invalid profile payload"];
  if (payload.fullName !== undefined && !String(payload.fullName).trim()) return ["fullName cannot be empty"];
  return [];
}

module.exports = { validateProfilePayload };
