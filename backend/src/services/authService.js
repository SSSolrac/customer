const loginHistoryRepository = require("../repositories/loginHistoryRepository");
const userRepository = require("../repositories/userRepository");
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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function login(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "").trim();
  if (!email || !password) return null;

  const matchedDemo = DEMO_USERS.find((entry) => entry.email === email && entry.password === password);
  if (matchedDemo) {
    const role = matchedDemo.role;

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

  const stored = userRepository.findByEmail(email);
  if (!stored || String(stored.password || "").trim() !== password) return null;

  const role = normalizeRole(stored.role);
  if (role === "customer") {
    const profile = profileService.upsertProfile(stored.id, { name: stored.name, email });
    return {
      id: profile.id,
      customerCode: profile.customerCode,
      name: profile.name || stored.name,
      email,
      role
    };
  }

  return {
    id: stored.id,
    name: stored.name,
    email,
    role
  };
}

function signup(payload) {
  const fullName = String(payload.fullName || payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "").trim();
  const role = normalizeRole(payload.role);

  if (!fullName || !email || !password) {
    const error = new Error("fullName, email, and password are required.");
    error.status = 400;
    throw error;
  }

  if (DEMO_USERS.some((user) => user.email === email) || userRepository.findByEmail(email)) {
    const error = new Error("Email already exists.");
    error.status = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const user = userRepository.create({
    id: makeId("user"),
    name: fullName,
    email,
    password,
    role,
    createdAt: now,
    updatedAt: now
  });

  if (role === "customer") {
    const profile = profileService.upsertProfile(user.id, { name: fullName, email });
    return {
      id: profile.id,
      customerCode: profile.customerCode,
      name: profile.name || fullName,
      email,
      role
    };
  }

  return {
    id: user.id,
    name: user.name,
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

module.exports = { login, signup, logLoginHistory, getLoginHistory, getLoginHistoryStats };
