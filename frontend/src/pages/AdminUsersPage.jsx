// src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import { getAllUsers } from "../services/api";
import { Link } from "react-router-dom";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Користувачі</h1>
      <table className="min-w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Імʼя</th>
            <th className="p-2 border">Сорти</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="p-2 border">{user.id}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">
                <Link
                  to={`/admin/users/${user.id}/varieties`}
                  className="text-blue-600 underline"
                >
                  Переглянути сорти
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
