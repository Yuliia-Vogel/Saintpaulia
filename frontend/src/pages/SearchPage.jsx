import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("query") || "";
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState([]);

useEffect(() => {
  fetchSearchResults(query);  // навіть якщо query порожній
}, [query]);

  const fetchSearchResults = async (q) => {
    try {
      const res = await fetch(`/api/saintpaulia/saintpaulias/search/?name=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} - ${errText}`);
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Помилка під час завантаження пошуку:", err);
      setResults([]);  // щоб хоч щось рендерити, навіть якщо порожньо
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    // Оновлюємо URL (щоб можна було відновити з нього стан)
    window.history.pushState({}, "", `/search?query=${encodeURIComponent(query)}`);
    fetchSearchResults(query);
  };

  return (
    <div>
      <input value={query} onChange={handleInputChange} />
      <button onClick={handleSearch}>Пошук</button>
      <ul>
        {results.map((variety) => (
          <li key={variety.name}>
            <Link 
              to={`/variety/${encodeURIComponent(variety.name)}`} 
              state={{ fromQuery: query }}
            >
              {variety.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
