const loginHistoryRepository = require("../repositories/loginHistoryRepository");
const { makeId } = require("../utils/id");

function logLoginHistory(payload) {
  const entry = {
    id: makeId("login_history"),
    userId: payload.userId,
    userName: payload.userName,
    role: payload.role,
    loginTime: payload.loginTime || new Date().toISOString(),
    logoutTime: payload.logoutTime || null,
    ipAddress: payload.ipAddress || null,
    device: payload.device || null,
    loginStatus: payload.loginStatus || "success"
  };
  return loginHistoryRepository.create(entry);
}

function getLoginHistory() {
  return loginHistoryRepository.findAll();
}

module.exports = { logLoginHistory, getLoginHistory };
