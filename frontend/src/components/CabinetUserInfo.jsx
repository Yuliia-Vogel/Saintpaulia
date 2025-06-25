// components/CabinetUserInfo.jsx
import { useAuth } from "../context/AuthContext";

const CabinetUserInfo = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-gray-50 p-4 rounded shadow">
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Роль:</strong> {user.role}</p>
      <p><strong>Підтверджено:</strong> {user.confirmed ? "✅ Так" : "❌ Ні"}</p>
    </div>
  );
};

export default CabinetUserInfo;
