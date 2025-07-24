// src/components/EditRoleModal.jsx
import React from "react";

const modalBackdrop = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const modalBox = "bg-white rounded-2xl p-6 shadow-xl w-full max-w-md";

export default function EditRoleModal({ user, onClose, onSave }) {
  if (!user) return null;

  const [selectedRole, setSelectedRole] = React.useState(user.role);

  const handleSave = () => {
    onSave(selectedRole);
  };

  return (
    <div className={modalBackdrop} onClick={onClose}>
      <div className={modalBox} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Редагування ролі</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Нова роль:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="user">Користувач</option>
            <option value="expert">Експерт</option>
            <option value="breeder">Селекціонер</option>
            <option value="admin">Адміністратор</option> 
            <option value="superadmin">Суперадмін</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}
