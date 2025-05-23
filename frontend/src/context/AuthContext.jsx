import { createContext, useContext, useEffect, useState } from "react";
import { getUserFromToken, getUserData } from "../services/authService"; // додай getUserData
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Отримати user з бекенду (з підтвердженням!)
  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Не вдалося отримати дані користувача", error);
      setUser(null); // або не міняти, залежно від логіки
    }
  };

  // Перевірка токена при завантаженні сторінки
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // з бекенду, а не з токена:
      fetchUserData();
    }
  }, []);

  // після логіну:
  const loginUser = (response) => {
    localStorage.setItem("accessToken", response.access_token);
    localStorage.setItem("refreshToken", response.refresh_token);
    setUser(response.user); // user повинен містити confirmed
  };

  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loginUser, logoutUser, fetchUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
