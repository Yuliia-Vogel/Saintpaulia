// src/pages/UploadPhoto.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { uploadVarietyPhoto } from "../services/api";
import { toast } from "sonner";

export default function UploadPhoto() {
  const { varietyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { varietyName } = location.state || { varietyName: `сорт ID: ${varietyId}` };

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Будь ласка, виберіть файл.");
      return;
    }

    setIsLoading(true);

    try {
      await uploadVarietyPhoto(varietyId, file);

      toast.success("Фото успішно завантажено!");

      setTimeout(() => {
        navigate(`/variety/${encodeURIComponent(varietyName)}`);
      }, 1000); 

    } catch (err) {
      const msg = err.response?.data?.detail || "Помилка завантаження фото.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Завантажити фото для сорту</h1>
      <h2 className="text-xl text-gray-600 mb-6">{varietyName}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Виберіть файл зображення
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>

        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Прев'ю:</p>
            <img src={preview} alt="Прев'ю завантаження" className="mt-2 rounded-lg shadow-md max-h-80 w-auto" />
          </div>
        )}

        <button 
          type="submit" 
          disabled={!file || isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-md
                     hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Завантаження..." : "Завантажити"}
        </button>
      </form>
      
      <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 hover:underline">
        ← Назад до сорту
      </button>
    </div>
  );
}
