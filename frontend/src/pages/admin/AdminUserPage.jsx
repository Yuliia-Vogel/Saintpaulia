// src/pages/admin/AdminUsersPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../../services/api";
import { Link } from "react-router-dom";

const AdminUserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        console.error("Помилка завантаження користувача", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p className="p-4">Завантаження...</p>;
  if (!user) return <p className="p-4 text-red-600">Користувача не знайдено</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Профіль користувача #{user.id}</h1>

      <div className="space-y-2 text-sm">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Роль:</strong> {user.role}</p>
        <p><strong>Підтверджено:</strong> {user.confirmed ? "Так" : "Ні"}</p>
      </div>

      <Link to={`/admin/users/${user.id}/varieties`} className="mt-4 inline-block text-blue-600 underline">
        👉 Переглянути сорти користувача
      </Link>
    </div>
  );
};

export default AdminUserPage;
