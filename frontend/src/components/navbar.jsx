import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./button";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path;

  return (
    <nav className="time-nav">
      <Link to="/" className="logo-mark">
        <span className="logo-symbol">
          T
        </span>

        <span>TimeLens</span>
      </Link>

      <div className="nav-links">
        <Link
          to="/dashboard"
          className={
            isActive("/dashboard")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Dashboard
        </Link>

        <Link
          to="/plan-track"
          className={
            isActive("/plan-track")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Plan & Track
        </Link>

        <Link
          to="/insights"
          className={
            isActive("/insights")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Insights
        </Link>

        <Link
          to="/profile"
          className={
            isActive("/profile")
              ? "nav-link active"
              : "nav-link"
          }
        >
          Profile
        </Link>
      </div>

      <Button
        onClick={() => navigate("/auth")}
      >
        Get Started
      </Button>
    </nav>
  );
}

export default Navbar;