import { useAuth } from "../context/AuthContext";
import EmailConfirmationNotice from "./EmailConfirmationNotice";

const Header = () => {
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
  noticeBlock: {
    marginTop: "1rem",
  },
};

export default Header;
