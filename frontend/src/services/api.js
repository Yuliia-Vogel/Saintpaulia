// src/services/api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "./authService";

console.log("The API URL will be used now")
const API_URL = import.meta.env.VITE_API_URL;
console.log("The API URL my code is using is:", API_URL)

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,  // Загальний таймаут 10 секунд для будь-якого запиту
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

api.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    try {
      // Окремий axios-запит з коротшим тайм-аутом для refresh
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { timeout: 5000 }  // таймаут 5 секунд саме для refresh
      );

      accessToken = response.data.access_token;
      localStorage.setItem("accessToken", accessToken);

      // Оновлюємо заголовки запиту
      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      console.error("Помилка оновлення токена:", error);

      // Автоматичний логаут
      logout();

      // Перенаправлення на сторінку логіну (можна налаштувати)
      window.location.href = "/login";

      return Promise.reject(error);
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;

export const verifyVariety = async (name, data) => {
  const response = await api.put(`/saintpaulia/verify/${encodeURIComponent(name)}`, data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getUserVarieties = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/varieties`);
  return response.data;
};

export const getVarietyLogs = async (varietyId) => {
  const response = await api.get(`/admin/variety-logs/variety/${varietyId}`);
  return response.data;
};

export const getPhotoLogs = async (varietyId) => {
  const response = await api.get(`/admin/photo-logs/variety/${varietyId}`);
  return response.data;
};

export const deletePhoto = async (photoId) => {
  const response = await api.delete(`/photos/delete/${photoId}`);
  return response.status === 204;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const deleteVariety = async (name) => {
  const response = await api.delete(`/saintpaulia/${encodeURIComponent(name)}`);
  return response.data;
};

export const finalDeleteVariety = async (varietyId) => {
  try {
    const response = await api.delete(`/admin/varieties/${varietyId}`);
    return response.data;
  } catch (error) {
    console.error("Помилка при остаточному видаленні сорту:", error.response?.data || error);
    throw error;
  }
};

export const getDeletedVarieties = async () => {
  const response = await api.get("/admin/varieties/deleted");
  return response.data;
};

export const deleteUser = async (userId) => {
  return await api.delete(`/admin/users/${userId}`);
};