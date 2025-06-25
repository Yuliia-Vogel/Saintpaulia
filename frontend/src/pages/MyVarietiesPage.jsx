// pages/MyVarietiesPage.jsx
import MyVarietiesList from "../components/MyVarietiesList";

const MyVarietiesPage = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌱 Мої сорти</h1>
      <MyVarietiesList />
    </div>
  );
};

export default MyVarietiesPage;
