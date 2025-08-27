// src/pages/UserVarietiesPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserVarieties } from "../services/api";
import VarietyListItem from "../components/VarietyListItem";

const UserVarietiesPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setLoading(true); 
    getUserVarieties(userId)
      .then(({ user, varieties }) => {
        setUser(user);
        setVarieties(varieties);
      })
      .catch(console.error)
      .finally(() => setLoading(false)); 
  }, [userId]);

  if (loading) return <p className="p-4">⏳ Завантаження сортів користувача...</p>;
  
  if (!user) return <p className="p-4">Не вдалося завантажити дані про користувача.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        🌱 Сорти користувача: {user.name} ({user.email})
      </h1>

      {varieties.length === 0 ? (
        <p>Користувач ще не додав жодного сорту.</p>
      ) : (
        <ul className="space-y-4">
          {varieties.map((variety) => (
            <VarietyListItem key={variety.id} variety={variety} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserVarietiesPage;