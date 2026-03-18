import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const REFRESH_ENDPOINT = "/api/auth/refresh";
const REFRESH_COOLDOWN_MS = 10 * 1000; // 10 seconds - allow faster retry after transient failures
const POST_LOGIN_GRACE_MS = 90 * 1000; // Don't attempt refresh (and thus logout) within 90s of login

let lastRefreshTime = 0;
let lastLoginTime = 0;
let refreshPromise: Promise<string | null> | null = null;

export function setLastLoginTime(): void {
  lastLoginTime = Date.now();
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
}

function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("refreshToken", token);
}

export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("adminAccessToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("admin");
}

function logoutAndRedirect(): void {
  clearAuthTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-storage-change"));
    window.location.href = "/auth/sign-in";
  }
}

const SKIP_REFRESH_PATHS = [
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/logout-all",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
];

function shouldSkipRefreshInterceptor(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const path = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost").pathname;
    return SKIP_REFRESH_PATHS.some((p) => path === p || path.endsWith(p));
  } catch {
    return false;
  }
}

function canAttemptRefresh(): boolean {
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
    return false;
  }
  return true;
}

async function doRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  // Don't attempt refresh during grace period after login (avoids 401 → logout right after login)
  if (Date.now() - lastLoginTime < POST_LOGIN_GRACE_MS) {
    return null;
  }

  if (!canAttemptRefresh()) {
    return null;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  lastRefreshTime = Date.now();

  refreshPromise = (async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const response = await fetch(`${baseUrl}${REFRESH_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logoutAndRedirect();
        }
        return null;
      }

      const data = (await response.json()) as {
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        user?: Record<string, unknown>;
      };
      const nextAccessToken = data.accessToken;
      const nextRefreshToken = data.refreshToken;

      if (nextAccessToken && typeof window !== "undefined") {
        setAccessToken(nextAccessToken);
        if (nextRefreshToken) setRefreshToken(nextRefreshToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        // Notify AuthContext and other listeners that tokens have been refreshed
        window.dispatchEvent(new Event("auth-storage-change"));
        return nextAccessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (shouldSkipRefreshInterceptor(config.url)) return config;

  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (shouldSkipRefreshInterceptor(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newToken = await doRefresh();
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  }
);
