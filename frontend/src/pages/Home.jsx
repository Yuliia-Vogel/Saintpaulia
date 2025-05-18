// src/pages/Home.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8000/saintpaulia/saintpaulias";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_BASE}/search/?name=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Помилка при пошуку.");
      const data = await response.json();
      setResults(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
  };

  const handleShowAll = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      if (!response.ok) throw new Error("Помилка при завантаженні.");
      const data = await response.json();
      setResults(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
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

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ marginTop: "20px" }}>
        {results.map((item) => (
          <li key={item.name}>
            <Link to={`/variety/${encodeURIComponent(item.name)}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
