import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("collabdocs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function saveSession(token, user) {
  localStorage.setItem("collabdocs_token", token);
  localStorage.setItem("collabdocs_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("collabdocs_token");
  localStorage.removeItem("collabdocs_user");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("collabdocs_user");
  return raw ? JSON.parse(raw) : null;
}

export default api;
