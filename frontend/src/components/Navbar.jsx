import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const links = [{ to: "/providers", label: "Find providers" }];
  if (user?.role === "customer")
    links.push({ to: "/my-bookings", label: "My bookings" });
  if (user?.role === "provider") {
    links.push({ to: "/provider/dashboard", label: "Requests" });
    links.push({ to: "/provider/profile", label: "Profile" });
    links.push({ to: "/provider/availability", label: "Availability" });
  }
  if (user?.role === "admin") links.push({ to: "/admin", label: "Admin" });
  if (user) links.push({ to: "/settings", label: "Settings" });
  const linkClass = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-[#172033]"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 lg:grid-cols-[1fr_auto_1fr]">
        {/* Left: logo */}
        <Link to="/" className="flex items-center gap-2.5 justify-self-start">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-extrabold text-white shadow-sm">
            S
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#172033]">
            ServiceConnect
          </span>
        </Link>

        {/* Center: links (desktop) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: user area (desktop) */}
        <div className="hidden items-center gap-3 justify-self-end lg:flex">
          {user ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <div className="max-w-[8rem] leading-tight">
                  <p className="truncate text-sm font-semibold text-[#172033]">
                    {user.name}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary gap-1.5"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile / tablet controls */}
        <div className="flex items-center gap-2 justify-self-end lg:hidden">
          {user && <NotificationBell />}
          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 lg:hidden">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {user.name?.[0]?.toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-[#172033]">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-slate-500">{user.role}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="btn-secondary w-full gap-1.5"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary flex-1"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
