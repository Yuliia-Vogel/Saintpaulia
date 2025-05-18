import { createContext, useContext, useEffect, useState } from "react";
import { getUserFromToken } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Перевірка токена при завантаженні
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const userData = getUserFromToken(token);
      setUser(userData);
    }
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
