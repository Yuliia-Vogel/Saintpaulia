// src/services/authService.js
import axios from "axios";

// Авторизація (логін)
export const login = async (email, password) => {
  const data = new URLSearchParams();
  data.append("username", email);
  data.append("password", password);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, user } = res.data;

    // Зберігаємо токени
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    // Повертаємо користувача з токенами
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
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/confirm-email/request`,
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

// (необов’язково) Очистити всі токени
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
