// src/pages/admin/AdminPanel.jsx
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Адмін-панель</h1>
      
      <div className="flex flex-col gap-4">
        <Link
          to="/admin/varieties/deleted"
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
        >
          🗑️ Архів сортів (видалені)
        </Link>

        <Link
          to="/admin/users"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold"
        >
          👥 Зареєстровані користувачі
        </Link>
      </div>
    </div>
  );
}
