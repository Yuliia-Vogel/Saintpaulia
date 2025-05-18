import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header style={{ padding: "1rem", textAlign: "right", background: "#f5f5f5" }}>
      {user ? (
        <span>👋 Ви авторизовані як <strong>{user.email}</strong></span>
      ) : (
        <span>🔒 Ви ще не увійшли в свій акаунт</span>
      )}
    </header>
  );
};

export default Header;
