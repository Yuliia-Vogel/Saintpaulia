import { useAuth } from "../context/AuthContext";
import EmailConfirmationNotice from "./EmailConfirmationNotice";

const Header = () => {
  const { user } = useAuth();

  return (
    <header style={{ padding: "1rem", background: "#f5f5f5" }}>
      <div style={{ textAlign: "right" }}>
        {user ? (
          <span>👋 Ви авторизовані як <strong>{user.email}</strong></span>
        ) : (
          <span>🔒 Ви ще не увійшли в свій акаунт</span>
        )}
      </div>

      {user && !user.confirmed && (
        <div style={{ marginTop: "1rem" }}>
          <EmailConfirmationNotice email={user.email} />
        </div>
      )}
    </header>
  );
};

export default Header;
