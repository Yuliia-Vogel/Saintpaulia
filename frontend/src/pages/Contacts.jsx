import { useEffect, useState } from "react";
import api from "../services/api"; // axios або fetch-обгортка

export default function Contacts() {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    api.get("/contact-info").then((res) => {
      setContact(res.data);
    });
  }, []);

  if (!contact) return <p>Завантаження...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">
        Контакти
      </h1>
      <p className="text-lg text-gray-700 mb-4 text-center">
        Якщо у вас є пропозиції, ідеї чи зауваження — зв’яжіться з нами:
      </p>
      <div className="text-center space-y-3">
        <p>
          <strong>Email:</strong>{" "}
          <a
            href={`mailto:${contact.email}`}
            className="text-purple-600 hover:underline"
          >
            {contact.email}
          </a>
        </p>
        {/* {contact.phone && (
          <p>
            <strong>Телефон:</strong> {contact.phone}
          </p>
        )} */}
      </div>
    </div>
  );
}
