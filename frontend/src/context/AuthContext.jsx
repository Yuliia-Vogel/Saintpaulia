// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/jwt";
import api from "../services/api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      let token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Перевірка протермінування та оновлення токена
      if (token && isTokenExpired(token) && refreshToken) {
        try {
          const response = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });
          token = response.data.access_token;
          localStorage.setItem("accessToken", token);
        } catch (error) {
          console.error("Помилка оновлення токена в AuthContext:", error);
          logoutUser();
          return;
        }
      }

      // Якщо токен валідний — декодуємо і зберігаємо
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.user_id,
            email: decoded.sub,
            role: decoded.role,
            confirmed: decoded.confirmed,
            accessToken: token,
          });
        } catch (e) {
          console.error("Помилка декодування токена:", e);
          logoutUser();
        }
      }
    };

    initializeUser();
  }, []);

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
