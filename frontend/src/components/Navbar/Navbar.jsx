import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";
import { Stethoscope } from "lucide-react";

function Navbar() {
  const { user, logoutUser } = useAuth();

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        <div className="logo-area">
          <Stethoscope className="logo-icon" size={24} />
          <span className="logo-text">MedAssist AI</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-secondary">Dashboard</Link>
              <button onClick={logoutUser} className="btn-primary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log In</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;