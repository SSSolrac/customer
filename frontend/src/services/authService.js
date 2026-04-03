import { requestJson, unwrapData } from "./api";

export async function login(payload) {
  const response = await requestJson("/auth/login", { method: "POST", body: payload });
  return unwrapData(response, null);
}

export async function createLoginHistory(payload) {
  const response = await requestJson("/auth/login-history", { method: "POST", body: payload });
  return unwrapData(response, null);
}

export async function getLoginHistory() {
  const response = await requestJson("/auth/login-history");
  return unwrapData(response, { rows: [], total: 0 });
}

export async function getLoginHistoryStats() {
  const response = await requestJson("/auth/login-history/stats");
  return unwrapData(response, { totalToday: 0, failed: 0, staff: 0, customer: 0 });
}
