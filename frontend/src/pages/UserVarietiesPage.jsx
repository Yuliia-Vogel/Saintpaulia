// src/pages/UserVarietiesPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserVarieties } from "../services/api";

const UserVarietiesPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [varieties, setVarieties] = useState([]);

  useEffect(() => {
    getUserVarieties(userId)
      .then(({ user, varieties }) => {
        setUser(user);
        setVarieties(varieties);
      })
      .catch(console.error);
  }, [userId]);

  if (!user) return <p>⏳ Завантаження...</p>;
  if (varieties.length === 0)
    return <p>Користувач {user.name} не має жодного сорту.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        🌱 Сорти користувача: {user.name} ({user.email})
      </h1>

      <ul className="space-y-2">
        {varieties.map((v) => (
          <li
            key={v.id}
            className="p-3 rounded border hover:shadow bg-white"
          >
            <Link
              to={`/variety/${v.name}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {v.name}
            </Link>
            {v.description && (
              <p className="text-sm text-gray-600 mt-1">{v.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserVarietiesPage;
