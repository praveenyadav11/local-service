import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        ServiceConnect
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/providers">Providers</Link>
        {user?.role === "customer" && (
          <Link to="/my-bookings">My Bookings</Link>
        )}
        {user?.role === "provider" && (
          <Link to="/provider/dashboard">Dashboard</Link>
        )}
        {user?.role === "provider" && (
          <Link to="/provider/profile">My Profile</Link>
        )}
        {user?.role === "provider" && (
          <Link to="/provider/availability">Availability</Link>
        )}
        
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <NotificationBell />
            <span className="text-slate-500">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
