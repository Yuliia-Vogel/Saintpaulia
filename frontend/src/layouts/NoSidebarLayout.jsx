// src/layouts/NoSidebarLayout.jsx
import { Outlet } from "react-router-dom";


export default function NoSidebarLayout() {
  return (
    <div className="flex">
      {/* Основний контент сторінки, який буде займати весь доступний простір */}
      <main className="flex-1 p-6 bg-white">
        {/* Outlet - це спеціальний компонент, який каже "сюди рендерити дочірні роути" */}
        <Outlet />
      </main>
    </div>
  );
}