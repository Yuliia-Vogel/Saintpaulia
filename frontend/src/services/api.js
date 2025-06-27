// src/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// Перевірка, чи токен протермінувався
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Додаємо перехоплювач запитів
api.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    try {
      const response = await api.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      accessToken = response.data.access_token;
      localStorage.setItem("accessToken", accessToken);

      // Оновлення заголовків
      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      console.error("Помилка оновлення токена:", error);
      logout();
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;
