// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/jwt";
import api from "../services/api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const initializeUser = async () => {
    console.log("AuthContext: старт ініціалізації");
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // Перевірка протермінування та оновлення токена
    // if (token && isTokenExpired(token) && refreshToken) {
    //   try {
    //     const response = await api.post("/auth/refresh", {
    //       refresh_token: refreshToken,
    //     });
    //     token = response.data.access_token;
    //     localStorage.setItem("accessToken", token);
    //     console.log("AuthContext: ініціалізація завершена, user:", user);
    //   } catch (error) {
    //     console.error("Помилка оновлення токена в AuthContext:", error);
    //     logoutUser();
    //     return;
    //   }
    // }

    // Якщо токен валідний — декодуємо і зберігаємо
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const newUser = {
          id: decoded.user_id,
          email: decoded.sub,
          role: decoded.role,
          confirmed: decoded.confirmed,
          accessToken: token,
        };

        setUser((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(newUser)) {
            return newUser;
          }
          return prev;
        });

        console.log("AuthContext: ініціалізація завершена, user:", newUser);
      } catch (e) {
        console.error("Помилка декодування токена:", e);
        logoutUser();
      }
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);