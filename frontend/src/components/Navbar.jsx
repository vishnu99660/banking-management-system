import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/navbar.css';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>💳 FinanceHub</h1>
        </div>
        <ul className="navbar-menu">
          <li><a href="/dashboard" className="nav-link">Dashboard</a></li>
          <li><a href="/accounts" className="nav-link">Accounts</a></li>
          <li><a href="/transactions" className="nav-link">Transactions</a></li>
        </ul>
        <div className="navbar-user">
          <span className="user-email">{user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
