import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isPasswordTooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Невірне або відсутнє посилання.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не співпадають.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль має містити щонайменше 8 символів.");
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        token: token,
        new_password: password,
      });

      setMessage("Пароль успішно змінено. Зараз ви будете перенаправлені до входу.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        setError("Посилання для зміни пароля недійсне або застаріле.");
      } else {
        setError("Трапилася помилка. Спробуйте ще раз пізніше.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Встановити новий пароль</h2>

      {message && <div className="text-green-600 mb-4">{message}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Новий пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-blue-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Приховати" : "Показати"}
            </button>
          </div>
          {isPasswordTooShort && (
            <div className="text-sm text-red-500 mt-1">
              Пароль має містити щонайменше 8 символів.
            </div>
          )}
        </div>

        <div>
          <label className="block mb-1">Повторіть пароль</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-blue-500"
              onClick={() => setShowConfirm((prev) => !prev)}
            >
              {showConfirm ? "Приховати" : "Показати"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Зберегти новий пароль
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
