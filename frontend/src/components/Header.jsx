import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmailConfirmationNotice from "./EmailConfirmationNotice";

const Header = () => {
  console.log("🧢 Rendering Header");
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <div style={styles.userBlock}>
        {user ? (
          <span>
            👋 Ви авторизовані як <strong>{user.email}</strong>{" "}
            {user.role && <span>(роль: <strong>{user.role}</strong>)</span>}
          </span>
        ) : (
          <span>🔒 Ви ще не увійшли в свій акаунт</span>
        )}
      </div>

      {user && (
        <div style={styles.cabinetLink}>
          <Link to="/cabinet">👤 Мій кабінет</Link>
          </div>
        )}

      {user && !user.confirmed && (
        <div style={styles.noticeBlock}>
          <EmailConfirmationNotice email={user.email} />
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    padding: "1rem",
    background: "#f5f5f5",
  },
  userBlock: {
    textAlign: "right",
    fontSize: "0.95rem",
    color: "#333",
  },

  cabinetLink: {
    marginTop: "0.5rem",
    textAlign: "right",
    fontSize: "0.95rem",
  },

  noticeBlock: {
    marginTop: "1rem",
  },
};

export default Header;
