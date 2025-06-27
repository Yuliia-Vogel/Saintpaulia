// src/services/authService.js
import axios from "axios";
import { API_ROUTES } from "../utils/apiRoutes";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL;

// Авторизація (логін)
export const login = async (email, password) => {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);

  try {
    const res = await axios.post(`${API_URL}${API_ROUTES.login}`, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token, refresh_token, user } = res.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    return {
      ...user,
      accessToken: access_token,
      refreshToken: refresh_token,
    };
  } catch (error) {
    console.error("Помилка логіну:", error);
    throw error;
  }
};

// Надіслати запит на повторне надсилання листа підтвердження
export const requestConfirmationEmail = async (email) => {
  try {
    const response = await api.post(
      `${API_URL}${API_ROUTES.requestConfirmationEmail}`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Помилка надсилання листа підтвердження:", error);
    throw error;
  }
};

// (необов’язково) Отримати accessToken з локального сховища
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Очистити всі токени
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
