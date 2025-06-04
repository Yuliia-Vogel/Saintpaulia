import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅ тільки setUser

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userData = await login(email, password);
      setUser(userData); // email, role, confirmed, accessToken
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Невірна пошта або пароль");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Вхід</h2>
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* email */}
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

        {/* password */}
        <div>
          <label className="block mb-1">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border px-3 py-2 rounded pr-20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline"
            >
              {showPassword ? "Сховати" : "Показати"}
            </button>
          </div>
        </div>

        {/* button */}
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
