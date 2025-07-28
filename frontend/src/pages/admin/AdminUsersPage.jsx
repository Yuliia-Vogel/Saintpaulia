// src/pages/admin/AdminUsersPage.jsx
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import EditRoleModal from "../../components/admin/EditRoleModal";
import { getAllUsers, updateUserRole } from "../../services/api"; 
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

    // 🔧 Крок 1: Стан для фільтрів
  const [roleFilter, setRoleFilter] = useState({
    user: true,
    admin: true,
    superadmin: true,
  });

    // 🔧 Крок 2: Обробник перемикання чекбоксів
  const handleRoleToggle = (role) => {
    setRoleFilter((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Помилка завантаження користувачів:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleSaveRole = async (newRole) => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await updateUserRole(selectedUser.id, newRole);
      toast.success(`Роль користувача ${selectedUser.email} змінено на ${newRole}`);
      await fetchUsers(); // оновити список
    } catch (error) {
      toast.error("Помилка при зміні ролі користувача");
      console.error(error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  // 🔍 Крок 3: Фільтрація користувачів перед рендером
  const filteredUsers = users.filter((user) => roleFilter[user.role]);


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Користувачі</h1>

      {/* 📋 Крок 2: UI для фільтра ролей */}
      <div className="mb-4 flex gap-4 items-center">
        <span className="font-semibold">Фільтр за ролями:</span>
        {["user", "admin", "superadmin"].map((role) => (
          <label key={role} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={roleFilter[role]}
              onChange={() => handleRoleToggle(role)}
            />
            {role}
          </label>
        ))}
      </div>

      <table className="min-w-full border divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="text-left p-2">id</th>
            <th className="text-left p-2">Email</th>
            <th className="p-2 border">Сорти</th>
            <th className="text-left p-2">Роль</th>
            <th className="text-left p-2">Дії</th>
          </tr>
        </thead>
        <tbody>
           {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                Немає користувачів з вибраними ролями
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.id}</td>
                <td className="p-2">
                  <Link to={`/admin/users/${user.id}`} className="text-blue-600 underline hover:text-blue-800">
                    {user.email}
                  </Link>
                </td>
                <td className="p-2 border">
                  <Link
                    to={`/admin/users/${user.id}/varieties`}
                    className="text-blue-600 underline"
                  >
                    Переглянути сорти
                  </Link>
                </td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => handleOpenModal(user)}
                  >
                    Редагувати роль
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <EditRoleModal
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        loading={loading}
      />
    </div>
  );
}
          {/* {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.id}</td>
              <td className="p-2">
                <Link to={`/admin/users/${user.id}`} className="text-blue-600 underline hover:text-blue-800">
                  {user.email}
                </Link>
              </td>
              <td className="p-2 border">
                <Link
                  to={`/admin/users/${user.id}/varieties`}
                  className="text-blue-600 underline"
                >
                  Переглянути сорти
                </Link>
              </td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => handleOpenModal(user)}
                >
                  Редагувати роль
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditRoleModal
        user={selectedUser}
        onClose={handleCloseModal}
        
        onSave={handleSaveRole}
        loading={loading}
      />
    </div>
  );
} */}

