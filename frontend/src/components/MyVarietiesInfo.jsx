// components/MyVarietiesInfo.jsx
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const MyVarietiesInfo = () => {
  // Просто отримуємо користувача з контексту. Всі дані вже тут.
  const { user } = useAuth();

  // Якщо даних користувача ще немає, нічого не показуємо
  if (!user) return null;

  // Ніяких useEffect, useState, API-запитів!
  // Вся інформація вже є в `user.varieties_number`.

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Мої сорти</h2>
      <p>
        Всього додано вами сортів:{" "}
        <Link
          to="/my-varieties" // Переконайтесь, що цей роут існує
          className="text-blue-600 font-semibold hover:underline text-lg"
        >
          {user.varieties_number}
        </Link>
      </p>
    </div>
  );
};

export default MyVarietiesInfo;
