import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

/**
 * Teachers and students share one login and one token, so both axios
 * clients read the same storage key. `teacherApi` is kept as an alias so
 * existing imports keep working.
 */
export const TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";
export const ACCOUNT_TYPE_KEY = "accountType";

export type AccountType = "teacher" | "student";

export function getAccountType(): AccountType | null {
  return (localStorage.getItem(ACCOUNT_TYPE_KEY) as AccountType) || null;
}

export function saveSession(data: {
  accessToken: string;
  refreshToken: string;
  accountType: AccountType;
  user: unknown;
}) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(ACCOUNT_TYPE_KEY, data.accountType);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  [TOKEN_KEY, REFRESH_TOKEN_KEY, ACCOUNT_TYPE_KEY, USER_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
  // Clean up keys written by the old split-login build.
  ["teacherAccessToken", "teacherRefreshToken", "teacherUser"].forEach((k) =>
    localStorage.removeItem(k)
  );
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 (expired/invalid token), clear the session and bounce to the
// single login page rather than leaving the user on a broken dashboard.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
