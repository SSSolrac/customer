const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

const SESSION_STORAGE_KEY = "happyTailsSession_v2";

export class ApiError extends Error {
  constructor(message, { status, data, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function getCustomerId() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || "null");
    return session?.user?.id || "guest";
  } catch {
    return "guest";
  }
}

function buildUrl(path) {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
}

export async function requestJson(path, options = {}) {
  const url = buildUrl(path);
  const { body, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      "x-customer-id": getCustomerId(),
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed with status ${response.status}`, {
      status: response.status,
      data,
      url
    });
  }

  return data;
}

export function isApiAvailableError(error) {
  return error instanceof TypeError || error?.name === "AbortError";
}
