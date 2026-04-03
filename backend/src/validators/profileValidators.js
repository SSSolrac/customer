function validateProfilePayload(payload) {
  if (!payload || typeof payload !== "object") return ["Invalid profile payload"];
  if (payload.name !== undefined && !String(payload.name).trim()) return ["name cannot be empty"];
  return [];
}

module.exports = { validateProfilePayload };
