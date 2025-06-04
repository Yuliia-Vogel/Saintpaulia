import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
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
    <div style={{ padding: "20px" }}>
      <h1>Вітаємо у світі сенполій!</h1>
      <p>Спробуйте знайти сорт фіалки або перегляньте весь список:</p>

      <input
        type="text"
        placeholder="Введіть назву сорту"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: "10px", padding: "5px", width: "300px" }}
      />
      <button onClick={handleSearch} style={{ marginRight: "10px" }}>
        Пошук
      </button>
      <button onClick={handleShowAll}>Вивести всі сорти</button>
    </div>
  );
}
