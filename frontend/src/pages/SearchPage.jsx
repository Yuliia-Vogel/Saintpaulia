import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("query") || "";
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");           // для повід. про помилку
  const [isLoaded, setIsLoaded] = useState(false);  // щоб знати, коли запит завершився

  useEffect(() => {
    fetchSearchResults(query);
  }, [query]);

  const fetchSearchResults = async (q) => {
  try {
    setError("");
    setIsLoaded(false);

    const url = q.trim()
      ? `/api/saintpaulia/saintpaulias/search/?name=${encodeURIComponent(q)}`
      : `/api/saintpaulia/saintpaulias/`;

    const res = await fetch(url);
    if (!res.ok) {
      let errorMessage = "Сталася помилка.";
      try {
        const errJson = await res.json();
        errorMessage = errJson.detail || errorMessage;
      } catch {
        errorMessage = `HTTP ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    setResults(data);
  } catch (err) {
    setResults([]);
    setError(err.message || "Сталася помилка при завантаженні.");
  } finally {
    setIsLoaded(true);
  }
};

  const handleInputChange = (e) => setQuery(e.target.value);

  const handleSearch = () => {
    window.history.pushState({}, "", `/search?query=${encodeURIComponent(query)}`);
    fetchSearchResults(query);
  };

  return (
    <div>
      <input value={query} onChange={handleInputChange} />
      <button onClick={handleSearch}>Пошук</button>

      {isLoaded && error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}

      {isLoaded && !error && results.length === 0 && (
        <p style={{ marginTop: "20px" }}>Сортів не знайдено.</p>
      )}

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
