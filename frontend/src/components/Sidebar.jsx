// src/components/Sidebar.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Логіка, перенесена з Home.jsx
  const handleSearch = (e) => {
    e.preventDefault(); // Додаємо, щоб пошук працював і по натисканню Enter
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleShowAll = () => {
    navigate("/search");
  };

  return (
    <aside className="w-64 p-4 bg-gray-50 border-l h-screen sticky top-0">
      <h2 className="text-xl font-semibold mb-4">Пошук</h2>
      
      {/* Форма для простого пошуку */}
      <form onSubmit={handleSearch} className="space-y-3">
        <input
          type="text"
          placeholder="Назва сорту..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Знайти
        </button>
      </form>

      <hr className="my-4" />

      {/* Кнопка "Вивести всі" та лінк на розширений пошук */}
      <div className="space-y-3">
        <button 
          onClick={handleShowAll}
          className="w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Вивести всі сорти
        </button>
        <Link
          to="/extended-search"
          className="block text-center text-blue-600 hover:underline"
        >
          Розширений пошук →
        </Link>
      </div>
    </aside>
  );
}