// src/components/VarietyListItem.jsx
import { Link } from "react-router-dom";
import PlaceholderImage from '../assets/placeholder.png'; // 👇 Крок 1.1 - Створіть це зображення

// Допоміжна функція для перевірки URL
function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export default function VarietyListItem({ variety }) {
  const firstPhoto = variety.photos && variety.photos.length > 0
    ? variety.photos[0].file_url
    : null;

  // Якщо це валідний URL — беремо його, якщо ні — ставимо заглушку
  const imageUrl = firstPhoto && isValidHttpUrl(firstPhoto)
    ? firstPhoto
    : PlaceholderImage;

  // Обрізаємо опис до 150 символів для компактності
  const shortDescription = variety.description
    ? variety.description.substring(0, 150) + (variety.description.length > 150 ? "..." : "")
    : "Опис відсутній.";

  return (
    <li className="flex items-start p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
      {/* Зображення */}
      <img
        src={imageUrl}
        alt={variety.name}
        className="w-24 h-24 sm:w-32 sm:h-32 rounded-md object-cover mr-4 flex-shrink-0"
      />
      
      {/* Інформація про сорт */}
      <div className="flex-grow">
        <Link
          to={`/variety/${encodeURIComponent(variety.name)}`}
          className="text-xl font-bold text-blue-700 hover:underline"
        >
          {variety.name}
        </Link>
        
        {/* Мітка для видалених сортів (буде потрібна для DeletedVarietiesPage) */}
        {variety.is_deleted && (
          <span className="ml-2 text-xs font-semibold text-white bg-red-600 px-2 py-1 rounded-full">
            Видалено
          </span>
        )}
        
        <p className="mt-2 text-sm text-gray-700">
          {shortDescription}
        </p>
      </div>
    </li>
  );
}
