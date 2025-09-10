import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react';

import Header from "./components/Header"
import Navbar from './components/Navbar'
import MainLayout from './layouts/MainLayout'
import NoSidebarLayout from './layouts/NoSidebarLayout'
import ErrorBoundary from "./components/ErrorBoundary";
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ConfirmEmail from './pages/ConfirmEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import VarietyDetail from './pages/VarietyDetail'
import SearchPage from './pages/SearchPage'
import AddVariety from './pages/AddVariety'
import EditVariety from "./pages/EditVariety";
import UploadPhoto from './pages/UploadPhoto';
import PrivateRoute from './components/PrivateRoute';
import CabinetPage from './pages/CabinetPage';
import MyVarietiesPage from "./pages/MyVarietiesPage";
import ExtendedSearchPage from './pages/ExtendedSearchPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserVarietiesPage from './pages/UserVarietiesPage';
import AdminUserPage from './pages/admin/AdminUserPage'; 
import Contacts from './pages/Contacts';
import DeletedVarietiesPage from "./pages/admin/DeletedVarietiesPage";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminRoute from './components/admin/AdminRoute';


function App() {
  const [isLoading, setIsLoading] = useState(true); // Стан для відстеження завантаження
  console.log("Waking up the app...");
  useEffect(() => {
    // Цей код виконається лише один раз при першому завантаженні сайту
    const wakeUpServer = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL
        // Надсилаємо запит на наш "healthchecker"
        // повний URL-адресу мого бекенду
        await fetch(`${apiUrl}/api/v1/healthchecker`);
      } catch (error) {
        console.error("Could not wake up the server:", error);
      } finally {
        // Коли запит завершився (успішно чи з помилкою), ховаємо спінер
        setIsLoading(false);
      }
    };

    wakeUpServer();
  }, []); // Пустий масив означає, що ефект виконається один раз

  if (isLoading) {
    // Поки isLoading === true, показуємо спінер на весь екран
    return <div className="loading-spinner">Завантаження...</div>; 
    // Тут може бути гарний компонент спінера
  }

  // Коли бекенд прокинувся, показуємо звичайний додаток
  return (
    <ErrorBoundary>
      <Header />
      <Navbar />
      <Routes>
        <Route element={<NoSidebarLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact-info" element={<Contacts />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/add" element={<AddVariety />} />
          <Route path="/variety/:name" element={<VarietyDetail />} />
          <Route path="/variety/:name/edit" element={<EditVariety />} />
          <Route path="/variety/:id/upload-photo" element={<PrivateRoute><UploadPhoto /></PrivateRoute>} />
          <Route path="/cabinet" element={<PrivateRoute><CabinetPage /></PrivateRoute>} />
          <Route path="/my-varieties" element={<PrivateRoute><MyVarietiesPage /></PrivateRoute>} />
          <Route path="/extended-search" element={<ExtendedSearchPage />} />

          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/users/:userId/varieties" element={<AdminRoute><UserVarietiesPage /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserPage /></AdminRoute>} />
          <Route path="/admin/varieties/deleted" element={<AdminRoute><DeletedVarietiesPage /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>}  />

          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
