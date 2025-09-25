// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "../utils/jwt";
import api from "../services/api"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const initializeUser = async () => {
    console.log("AuthContext: Старт ініціалізації користувача...");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      // Крок 1: Перевірка та оновлення токена (ця логіка правильна і залишається)
      if (isTokenExpired(accessToken) && refreshToken) {
        console.log("AuthContext: Токен доступу застарів. Оновлюємо...");
        const response = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });
        const newAccessToken = response.data.access_token;
        localStorage.setItem("accessToken", newAccessToken);
      }
      
      // Крок 2: Отримання повних даних про користувача з бекенду
      // Замість розшифровки токена, ми робимо запит до ендпоінту /me
      console.log("AuthContext: Отримання повних даних профілю з /auth/me");
      const response = await api.get("/auth/me");
      
      // Крок 3: Збереження повного об'єкта користувача у стані
      setUser(response.data);
      console.log("AuthContext: Ініціалізація успішна. Користувач:", response.data);

    } catch (error) {
      console.error("AuthContext: Помилка під час ініціалізації або оновлення токена:", error);
      // Якщо будь-який із запитів (refresh або /me) провалився,
      // це означає, що сесія недійсна, тому виходимо.
      logoutUser(); 
    } finally {
      setIsInitializing(false);
    }
  };

  // Ця функція знадобиться вам на сторінці логіну
  const loginUser = async (email, password) => {
    // Робимо запит на логін
    const response = await api.post('/auth/login', { email, password });
    
    // Зберігаємо токени
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('refreshToken', response.data.refresh_token);
    
    // Одразу отримуємо повні дані користувача і оновлюємо стан
    // Це забезпечить миттєве оновлення UI після логіну
    const meResponse = await api.get("/auth/me");
    setUser(meResponse.data);
  };


  useEffect(() => {
    initializeUser();
  }, []);

  const contextData = {
    user,
    setUser, // Залишаємо на випадок, якщо потрібно оновити юзера з іншого місця (н-д, після редагування профілю)
    logoutUser,
    loginUser, // Додаємо функцію логіну в контекст
    isInitializing,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {/* Показуємо дочірні компоненти тільки після завершення ініціалізації */}
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);