import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  GraduationCap,
  Hammer,
  MapPin,
  PaintBucket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProviderCard from "../components/ProviderCard";
import ProviderCardSkeleton from "../components/ProviderCardSkeleton";

const iconFor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("plumb")) return Wrench;
  if (n.includes("electric")) return Zap;
  if (n.includes("tutor") || n.includes("teach")) return GraduationCap;
  if (n.includes("clean")) return Sparkles;
  if (n.includes("paint")) return PaintBucket;
  if (n.includes("carp")) return Hammer;
  return Briefcase;
};

const STEPS = [
  {
    icon: Search,
    title: "Find a provider",
    text: "Browse by service and city, or search near you.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a time slot",
    text: "See real availability and request a booking.",
  },
  {
    icon: Star,
    title: "Get it done",
    text: "Track status live, pay and leave a review.",
  },
];

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
    api
      .get("/providers", { params: { limit: 3 } })
      .then((res) => setFeatured(res.data.providers))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      city.trim()
        ? `/providers?city=${encodeURIComponent(city.trim())}`
        : "/providers",
    );
  };

  const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50";
  const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10";

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Trusted local professionals
          </span>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            {user?.role === "provider"
              ? `Welcome back, ${user.name}`
              : user?.role === "admin"
                ? "Platform control centre"
                : "Book local services in minutes"}
          </h1>
          <p className="mx-auto max-w-xl text-lg text-indigo-100">
            {user?.role === "provider"
              ? "Review new requests and keep your schedule up to date."
              : user?.role === "admin"
                ? "Manage users, verify providers and track platform activity."
                : "Plumbers, electricians, tutors and more. Real availability, live updates, verified providers."}
          </p>

          {user?.role === "provider" ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/provider/dashboard" className={primaryBtn}>
                View booking requests
              </Link>
              <Link to="/provider/availability" className={ghostBtn}>
                Set availability
              </Link>
            </div>
          ) : user?.role === "admin" ? (
            <div className="flex justify-center">
              <Link to="/admin" className={primaryBtn}>
                Open admin dashboard
              </Link>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSearch}
                className="mx-auto flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-indigo-950/30 sm:flex-row"
              >
                <label className="flex flex-1 items-center gap-3 px-3">
                  <MapPin className="h-5 w-5 shrink-0 text-indigo-500" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city, e.g. Hyderabad"
                    className="w-full bg-transparent py-3 text-sm text-[#172033] outline-none placeholder:text-slate-400"
                  />
                </label>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  <Search className="h-4 w-4" /> Find providers
                </button>
              </form>
              {!user && (
                <p className="text-sm text-indigo-100">
                  Are you a professional?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-white underline underline-offset-4"
                  >
                    Join as a provider
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#172033]">
                Browse by service
              </h2>
              <p className="text-slate-500">
                Pick a category to see providers.
              </p>
            </div>
            <Link
              to="/providers"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:inline-flex"
            >
              All providers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = iconFor(c.name);
              return (
                <Link
                  key={c._id}
                  to={`/providers?category=${c._id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold capitalize text-[#172033]">
                      {c.name}
                    </p>
                    {c.description && (
                      <p className="truncate text-xs text-slate-500">
                        {c.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold text-[#172033]">
            How it works
          </h2>
          <p className="text-slate-500">
            Three simple steps from search to done.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="absolute right-5 top-4 text-5xl font-extrabold text-slate-100">
                {i + 1}
              </span>
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-4 font-bold text-[#172033]">
                {title}
              </h3>
              <p className="relative mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      {(loading || featured.length > 0) && (
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#172033]">
                Recently joined providers
              </h2>
              <p className="text-slate-500">
                New professionals ready to take bookings.
              </p>
            </div>
            <Link
              to="/providers"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [1, 2, 3].map((n) => <ProviderCardSkeleton key={n} />)
              : featured.map((p) => <ProviderCard key={p._id} provider={p} />)}
          </div>
        </section>
      )}

      {/* CTA for visitors */}
      {!user && (
        <section className="flex flex-col items-center justify-between gap-5 rounded-3xl bg-[#172033] px-8 py-10 text-center text-white md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold">
              Offer your skills on ServiceConnect
            </h2>
            <p className="mt-1 text-slate-300">
              Create a profile, set your hours and start receiving bookings.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Become a provider <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}

export default Home;
