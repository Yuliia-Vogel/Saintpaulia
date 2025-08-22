// pages/CabinetPage.jsx
import CabinetUserInfo from "../components/CabinetUserInfo";
import MyVarietiesInfo from "../components/MyVarietiesInfo";

const CabinetPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👤 Особистий кабінет</h1>
      <CabinetUserInfo />
      <MyVarietiesInfo />
    </div>
  );
};

export default CabinetPage;
