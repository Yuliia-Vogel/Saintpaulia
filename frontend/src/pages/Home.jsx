// src/pages/Home.jsx
import { Link as RouterLink } from "react-router-dom";

export default function Home() {
  const SafeLink = ({ to, children, ...props }) => {
    if (RouterLink) {
      return (
        <RouterLink to={to} {...props}>
          {children}
        </RouterLink>
      );
    }
    return (
      <a href={to} {...props}>
        {children}
      </a>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Секція 1: Привітання та унікальність */}
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-800">
          Вітаємо у світі сенполій!
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Ми створили унікальний інструмент для колекціонерів та любителів
          фіалок, що дозволяє шукати сорти за більше ніж 10 характеристиками — від
          кольору квітів до форми листя.
        </p>
      </section>

      {/* Секція 2: Приєднуйтесь до спільноти (новий блок) */}
      <section className="bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">
          Приєднуйтесь до нашої спільноти!
        </h2>
        
        <p className="text-center text-gray-700 mb-6">
          Усі основні функції — пошук та перегляд сортів — <strong>доступні вам одразу,
          без реєстрації.</strong> <br />
          Реєстрація — це ваш крок до нашої спільноти та можливість зробити
          свій внесок у розвиток каталогу.
        </p>
        
        {/* Таблиця з можливостями */}
        <div className="overflow-x-auto rounded-lg border border-purple-200 shadow-inner">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                  Можливості
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  Відвідувач <span className="text-gray-500 font-normal">(це ви зараз)</span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  ✅ Повний доступ до перегляду та пошуку по каталогу.
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Користувач</td>
                <td className="px-6 py-4 text-gray-700">
                  ✅ Можливість створювати списки улюблених сортів, залишати коментарі (у майбутньому).
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Експерт</td>
                <td className="px-6 py-4 text-gray-700">
                  ✅ Додавання нових сортів до загальної бази даних.
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Селекціонер</td>
                <td className="px-6 py-4 text-gray-700">
                  ✅ Додавання та <strong>верифікація власних сортів</strong>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-gray-700 mt-6">
          Просто <SafeLink to="/register" className="text-purple-600 font-semibold hover:underline">зареєструйтесь</SafeLink>, щоб долучитися до нас!
          <br />
          Якщо ви досвідчений фіалковод або селекціонер, будь ласка,&nbsp;
          <SafeLink to="/contact-info" className="text-purple-600 font-semibold hover:underline">
            зв'яжіться з нами
          </SafeLink> після реєстрації для отримання відповідного статусу.
        </p>
      </section>

      {/* Секція 3: Дисклеймер */}
      <section className="bg-gray-50 border-l-4 border-gray-300 rounded-r-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          📌 Дисклеймер щодо використання матеріалів
        </h2>
        <div className="space-y-3 text-gray-700 leading-relaxed">
          <p>
            Всі матеріали на сайті мають виключно інформаційний та освітній
            характер і не переслідують комерційних цілей. Фотографії та описи
            можуть бути запозичені з відкритих джерел з обов'язковим посиланням
            на автора.
          </p>
          <p>
            Якщо Ви є правовласником будь-якого контенту і не бажаєте, щоб
            він був тут використаний, будь ласка,&nbsp;
            <SafeLink to="/contact-info" className="text-purple-600 hover:underline">
              зв’яжіться з нами
            </SafeLink>, і ми оперативно приберемо матеріали.
          </p>
        </div>
      </section>
    </div>
  );
}