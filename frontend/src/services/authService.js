import { requestJson, unwrapData } from "./api";

export async function login(payload) {
  const response = await requestJson("/auth/login", { method: "POST", body: payload });
  return unwrapData(response, null);
}

export async function logout(payload) {
  await requestJson("/auth/logout", { method: "POST", body: payload || {} });
}

export async function createLoginHistory(payload) {
  const response = await requestJson("/auth/login-history", { method: "POST", body: payload });
  return unwrapData(response, null);
}

export async function getLoginHistory() {
  const response = await requestJson("/auth/login-history");
  return unwrapData(response, []);
}

export async function getLoginHistoryStats() {
  const response = await requestJson("/auth/login-history/stats");
  return unwrapData(response, { totalToday: 0, failed: 0, owner: 0, staff: 0, customer: 0 });
}
