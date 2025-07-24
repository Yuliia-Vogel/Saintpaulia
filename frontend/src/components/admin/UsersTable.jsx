// src/components/admin/UsersTable.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UsersTable = ({ users, onEditClick }) => {
  const navigate = useNavigate();

  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Сорти користувача</th>
          <th className="border px-4 py-2">Роль</th>
          <th className="border px-4 py-2">Дії</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="border px-4 py-2">{user.id}</td>
            <td className="border px-4 py-2">{user.email}</td>
            <td className="border px-4 py-2">
              <Link
                to={`/admin/users/${user.id}/varieties`}
                className="text-blue-600 underline"
              >
                Переглянути сорти
              </Link> 
            </td>
            <td
              className="border px-4 py-2 text-blue-600 cursor-pointer underline"
              onClick={() => navigate(`/admin/roles/${user.role}`)}
            >
              {user.role}
            </td>
            <td className="border px-4 py-2 text-center">
              <Button variant="outline" onClick={() => onEditClick(user)}>
                🖉 Редагувати роль
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;
