import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PaginationControls from "../components/PaginationControls";
import api from "../services/api";

export default function SearchPage() {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("query") || "";
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const limit = 10;
  const offset = (currentPage - 1) * limit;

  useEffect(() => {
    fetchSearchResults(query);
  }, [query, currentPage]);

  const fetchSearchResults = async (q) => {
    try {
      setError("");
      setIsLoaded(false);

      const base = q.trim()
        ? `/saintpaulia/search/`
        : `/saintpaulia`;

      const params = new URLSearchParams();
      if (q.trim()) params.append("name", q.trim());
      params.append("limit", limit);
      params.append("offset", offset);

      const url = `${base}?${params.toString()}`;

      const response = await api.get(url);
      setResults(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error("❌ Error in search:", err);
      setResults([]);
      setTotal(0);
      setError(err.response?.data?.detail || "Сталася помилка при завантаженні.");
    } finally {
      setIsLoaded(true);
    }
  };

  const handleInputChange = (e) => setQuery(e.target.value);

  const handleSearch = () => {
    window.history.pushState({}, "", `/search?query=${encodeURIComponent(query)}`);
    setCurrentPage(1);
    fetchSearchResults(query);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex space-x-2 mb-4">
        <input
          value={query}
          onChange={handleInputChange}
          className="border border-gray-400 px-2 py-1 rounded w-full"
          placeholder="Пошук за назвою сорту..."
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Пошук
        </button>
      </div>

      {isLoaded && error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {isLoaded && !error && results.length === 0 && (
        <p className="text-gray-700 mb-4">Сортів не знайдено.</p>
      )}

      <ul className="space-y-2">
        {results.map((variety) => (
          <li key={variety.name}>
            <Link
              to={`/variety/${encodeURIComponent(variety.name)}`}
              state={{ fromQuery: query }}
              className="text-blue-700 hover:underline"
            >
              {variety.name}
            </Link>
          </li>
        ))}
      </ul>

      {results.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={limit}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
