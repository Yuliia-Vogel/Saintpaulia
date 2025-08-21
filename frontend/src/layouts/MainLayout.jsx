// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex">
      {/* Основний контент сторінки, який буде займати весь доступний простір */}
      <main className="flex-1 p-6 bg-white">
        {/* Outlet - це спеціальний компонент, який каже "сюди рендерити дочірні роути" */}
        <Outlet />
      </main>

      {/* Наша нова бічна панель */}
      <Sidebar />
    </div>
  );
}