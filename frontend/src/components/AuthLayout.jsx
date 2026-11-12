import { Link } from "react-router-dom";
import { CalendarCheck, ShieldCheck, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Real-time availability",
    text: "Pick a slot that is actually free.",
  },
  {
    icon: ShieldCheck,
    title: "Verified professionals",
    text: "Providers are reviewed by our team.",
  },
  {
    icon: Zap,
    title: "Live booking updates",
    text: "Get notified the moment anything changes.",
  },
];

function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl text-xl font-extrabold shadow-sm ${
          light
            ? "bg-white text-indigo-700"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
        }`}
      >
        S
      </span>
      <span
        className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-[#172033]"}`}
      >
        ServiceConnect
      </span>
    </Link>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-[#F8FAFC] lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold leading-tight">
              Trusted local services, booked in minutes.
            </h2>
            <p className="text-lg text-indigo-100">
              Plumbers, electricians, tutors and more, all in one place.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold">{t}</p>
                  <p className="text-sm text-indigo-100">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-indigo-200">
          © {new Date().getFullYear()} ServiceConnect
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-[#172033]">
                {title}
              </h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
