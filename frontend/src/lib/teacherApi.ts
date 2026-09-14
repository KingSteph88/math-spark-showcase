import axios from "axios";

export const teacherApi = axios.create({
  baseURL: "http://localhost:5000",
});

teacherApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("teacherAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 (expired/invalid token), clear the session and bounce to login
// rather than leaving the teacher stuck on a broken dashboard.
teacherApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("teacherAccessToken");
      localStorage.removeItem("teacherRefreshToken");
      localStorage.removeItem("teacherUser");
      if (typeof window !== "undefined" && window.location.pathname !== "/teacher-login") {
        window.location.href = "/teacher-login";
      }
    }
    return Promise.reject(error);
  }
);
