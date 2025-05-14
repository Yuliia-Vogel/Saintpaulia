import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" style={styles.link}>🌸 Fialka App</Link>
      </div>
      <div style={styles.buttons}>
        <Link to="/login" style={styles.link}>Увійти</Link>
        <Link to="/register" style={styles.link}>Реєстрація</Link>
        <Link to="/forgot-password" style={styles.link}>Забули пароль?</Link>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    background: '#e0d4f7',
  },
  buttons: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    textDecoration: 'none',
    color: '#4a0072',
    fontWeight: 'bold',
  }
}

export default Navbar
