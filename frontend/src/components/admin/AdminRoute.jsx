// src/components/AdminRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Поки ми перевіряємо користувача, показуємо спінер
    return <div className="loading-spinner">Перевірка доступу...</div>;
  }

  // Перевіряємо, чи користувач залогінений І чи є він адміном/суперадміном
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  if (!isAdmin) {
    // Якщо користувач не адмін, перенаправляємо його на сторінку "Не знайдено"
    return <Navigate to="*" replace />;
  }

  // Якщо всі перевірки пройшли, рендеримо дочірній компонент
  return children;
};

export default AdminRoute;