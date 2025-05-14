// src/pages/SearchPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = "http://localhost:8000/saintpaulia/saintpaulias";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (query) => {
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

  const onSubmitSearch = () => {
    setSearchParams({ query });
    handleSearch(query);
  };

  useEffect(() => {
  const currentQuery = searchParams.get("query") || "";
  setQuery(currentQuery); // оновлюємо поле вводу

  if (currentQuery) {
    handleSearch(currentQuery);
  } else {
    handleShowAll();
  }
  }, [searchParams]);


  return (
    <div style={{ padding: "20px" }}>
      <h1>Пошук сортів фіалок</h1>
      <input
        type="text"
        placeholder="Введіть назву сорту"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: "10px", padding: "5px", width: "300px" }}
      />
      <button onClick={() => onSubmitSearch()} style={{ marginRight: "10px" }}>
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
