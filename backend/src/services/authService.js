const loginHistoryRepository = require("../repositories/loginHistoryRepository");
const profileService = require("./profileService");
const { makeId } = require("../utils/id");

const SUPPORTED_ROLES = ["owner", "staff", "customer"];

const DEMO_USERS = [
  {
    id: "owner-demo",
    name: "Owner Demo",
    email: "owner@happytails.local",
    password: "owner123",
    role: "owner"
  },
  {
    id: "staff-demo",
    name: "Staff Demo",
    email: "staff@happytails.local",
    password: "staff123",
    role: "staff"
  },
  {
    id: "customer-demo",
    name: "Customer Demo",
    email: "customer@happytails.local",
    password: "customer123",
    role: "customer"
  }
];

function normalizeRole(role) {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "admin") return "owner";
  return SUPPORTED_ROLES.includes(normalized) ? normalized : "customer";
}

function login(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();
  if (!email || !password) return null;

  const requestedRole = normalizeRole(payload.role);
  const matchedDemo = DEMO_USERS.find((entry) => entry.email === email && entry.password === password);
  if (!matchedDemo) return null;

  const role = requestedRole === matchedDemo.role ? matchedDemo.role : matchedDemo.role;

  if (role === "customer") {
    const profile = profileService.getProfile(matchedDemo.id);
    return {
      id: profile.id,
      customerCode: profile.customerCode,
      name: profile.name || matchedDemo.name,
      email,
      role
    };
  }

  return {
    id: matchedDemo.id,
    name: matchedDemo.name,
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
    if (row.role === "owner") acc.owner += 1;
    if (row.role === "staff") acc.staff += 1;
    if (row.role === "customer") acc.customer += 1;
    return acc;
  }, { totalToday: 0, failed: 0, owner: 0, staff: 0, customer: 0 });
}

module.exports = { login, logLoginHistory, getLoginHistory, getLoginHistoryStats };
