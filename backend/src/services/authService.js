const loginHistoryRepository = require("../repositories/loginHistoryRepository");
const profileRepository = require("../repositories/profileRepository");
const { makeId } = require("../utils/id");

const SUPPORTED_ROLES = ["staff", "admin", "customer"];

function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  return SUPPORTED_ROLES.includes(normalized) ? normalized : "customer";
}

function login(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!email || !password) return null;

  const role = normalizeRole(payload.role);
  const profile = profileRepository.findAll().find((p) => String(p.email || "").toLowerCase() === email);

  return {
    id: profile?.id || makeId("user"),
    name: profile?.fullName || payload.name || email.split("@")[0] || "User",
    email,
    role
  };
}

function logLoginHistory(payload) {
  const role = normalizeRole(payload.role);
  const entry = {
    id: makeId("login_history"),
    userId: payload.userId || payload.id || makeId("user"),
    userName: payload.userName || payload.name || "Unknown",
    email: payload.email || null,
    role,
    device: payload.device || null,
    ipAddress: payload.ipAddress || null,
    loginStatus: payload.loginStatus || "success",
    loginTime: payload.loginTime || new Date().toISOString(),
    logoutTime: payload.logoutTime || null
  };
  return loginHistoryRepository.create(entry);
}

function getLoginHistory() {
  return loginHistoryRepository.findAll();
}

function getLoginHistoryStats() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const rows = getLoginHistory();

  return rows.reduce((acc, row) => {
    const loginDate = String(row.loginTime || "").slice(0, 10);
    if (loginDate === today) acc.totalToday += 1;
    if (String(row.loginStatus || "").toLowerCase() !== "success") acc.failed += 1;
    if (row.role === "staff") acc.staff += 1;
    if (row.role === "customer") acc.customer += 1;
    return acc;
  }, { totalToday: 0, failed: 0, staff: 0, customer: 0 });
}

module.exports = { login, logLoginHistory, getLoginHistory, getLoginHistoryStats };
