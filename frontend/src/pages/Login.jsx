import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getUserFromToken } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // ⬅️ Отримуємо функцію з контексту

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);
      const { access_token, refresh_token } = res.data;

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);

      // ⬇️ Витягуємо юзера з токена і зберігаємо в контекст
      const userData = getUserFromToken(access_token);
      loginUser(userData); // ⬅️ ОНОВЛЕННЯ КОНТЕКСТУ

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Невірна пошта або пароль");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Вхід</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Пароль</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Увійти
        </button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Забули пароль?
        </a>
      </div>
    </div>
  );
}

export default Login;
