import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Search,
  User,
  UserPlus,
  Wrench,
  Phone
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

const ROLES = [
  {
    value: "customer",
    icon: Search,
    title: "I need services",
    text: "Find and book providers",
  },
  {
    value: "provider",
    icon: Wrench,
    title: "I offer services",
    text: "Get bookings from customers",
  },
];

const strengthOf = (pw) => {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const label = ["Too short", "Weak", "Fair", "Good", "Strong"][
    pw.length < 6 ? 0 : score
  ];
  return { score: pw.length < 6 ? 0 : score, label };
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone:"",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const strength = strengthOf(form.password);
  const barColor = [
    "bg-slate-200",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-emerald-500",
  ][strength.score];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      navigate(form.role === "provider" ? "/provider/profile" : "/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join as a customer or as a service provider."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, icon: Icon, title, text }) => {
            const active = form.role === value;
            return (
              <button
                type="button"
                key={value}
                onClick={() => setForm({ ...form, role: value })}
                aria-pressed={active}
                className={`relative rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                {active && (
                  <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-indigo-600" />
                )}
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-sm font-bold text-[#172033]">{title}</p>
                <p className="text-xs text-slate-500">{text}</p>
              </button>
            );
          })}
        </div>

        <FormField
          label="Full name"
          icon={User}
          name="name"
          placeholder="Your name"
          autoComplete="name"
          maxLength={50}
          value={form.name}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email"
          icon={Mail}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Mobile number"
          icon={Phone}
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="9876543210"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <FormField
          label="Password"
          icon={Lock}
          name="password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          value={form.password}
          onChange={handleChange}
          required
          hint={
            form.password && (
              <span className="block space-y-1 pt-0.5">
                <span className="flex gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 flex-1 rounded-full ${n <= strength.score ? barColor : "bg-slate-200"}`}
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

        <button
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Create account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
