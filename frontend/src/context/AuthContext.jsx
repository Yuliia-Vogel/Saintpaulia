// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/jwt";
import api from "../services/api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const initializeUser = async () => {
    console.log("AuthContext: старт ініціалізації");
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (token && isTokenExpired(token) && refreshToken) {
        const response = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });
        token = response.data.access_token;
        localStorage.setItem("accessToken", token);
      }

      if (token) {
        const decoded = jwtDecode(token);
        const newUser = {
          id: decoded.user_id,
          email: decoded.sub,
          role: decoded.role,
          confirmed: decoded.confirmed,
          accessToken: token,
        };
        setUser(newUser);
        console.log("AuthContext: ініціалізація завершена, user:", newUser);
      }
    } catch (error) {
      console.error("Помилка ініціалізації або оновлення токена:", error);
      logoutUser(); // Якщо будь-яка помилка, виходимо
    } finally {
      setIsLoading(false); // Встановлюємо в false у будь-якому випадку
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  return (
    // Додаємо isLoading до об'єкта value
    <AuthContext.Provider value={{ user, setUser, logoutUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);