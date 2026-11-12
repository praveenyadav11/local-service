import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CalendarCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  LayoutDashboard,
  LogOut,
  Lock,
  Mail,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import { strengthOf, STRENGTH_COLORS } from "../utils/passwordStrength";

const ROLE_BADGE = {
  customer: "bg-sky-50 text-sky-700",
  provider: "bg-violet-50 text-violet-700",
  admin: "bg-indigo-50 text-indigo-700",
};

const SHORTCUTS = {
  customer: [
    { to: "/my-bookings", icon: CalendarCheck, label: "My bookings" },
    { to: "/providers", icon: Search, label: "Find providers" },
  ],
  provider: [
    { to: "/provider/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/provider/profile", icon: UserCog, label: "Business profile" },
    {
      to: "/provider/availability",
      icon: CalendarClock,
      label: "Availability",
    },
  ],
  admin: [{ to: "/admin", icon: LayoutDashboard, label: "Admin dashboard" }],
};

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const strength = strengthOf(form.newPassword);
  const mismatch = form.confirm && form.confirm !== form.newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirm) {
      setError("New password and confirmation do not match");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current one");
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Your password has been updated.");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#172033]">
          Profile & settings
        </h1>
        <p className="mt-1 text-slate-500">Manage your account and security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Account card */}
        <aside className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700" />
            <div className="px-5 pb-5">
              <span className="-mt-10 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-extrabold text-white shadow-lg ring-4 ring-white">
                {user.name?.[0]?.toUpperCase()}
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-[#172033]">
                {user.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-4 w-4" />{" "}
                <span className="truncate">{user.email}</span>
              </p>
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  ROLE_BADGE[user.role]
                }`}
              >
                {user.role}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              Shortcuts
            </h3>
            <ul className="space-y-1">
              {(SHORTCUTS[user.role] || []).map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Icon className="h-5 w-5 text-indigo-500" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 pb-1 pt-3 text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              <LogOut className="h-5 w-5" /> Log out
            </button>
          </section>
        </aside>

        {/* Security */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#172033]">
                  Change password
                </h2>
                <p className="text-sm text-slate-500">
                  Use a strong password you do not use elsewhere.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {success}
                </div>
              )}

              <FormField
                label="Current password"
                icon={Lock}
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
              <FormField
                label="New password"
                icon={Lock}
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={form.newPassword}
                onChange={handleChange}
                required
                hint={
                  form.newPassword && (
                    <span className="block space-y-1 pt-0.5">
                      <span className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <span
                            key={n}
                            className={`h-1.5 flex-1 rounded-full ${
                              n <= strength.score
                                ? STRENGTH_COLORS[strength.score]
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Strength: {strength.label}
                      </span>
                    </span>
                  )
                }
              />
              <FormField
                label="Confirm new password"
                icon={Lock}
                name="confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                required
                hint={
                  mismatch && (
                    <span className="block text-xs font-medium text-red-600">
                      Passwords do not match
                    </span>
                  )
                }
              />

              <button
                disabled={submitting || mismatch}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>

          <section className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-bold text-[#172033]">
                Keep your account safe
              </h3>
              <p className="text-sm text-slate-500">
                Never share your password. Log out on shared devices. Your
                password is stored encrypted and cannot be read by anyone,
                including us.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;
