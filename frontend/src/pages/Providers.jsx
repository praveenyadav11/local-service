import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Navigation,
  Search,
  SearchX,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import api from "../api/axios";
import ProviderCard from "../components/ProviderCard";
import ProviderCardSkeleton from "../components/ProviderCardSkeleton";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 9;

function Providers() {
    const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
   const [category, setCategory] = useState(searchParams.get("category") || "");
   const [cityInput, setCityInput] = useState(searchParams.get("city") || "");
   const [city, setCity] = useState(searchParams.get("city") || "");
    const [providers, setProviders] = useState([]);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (category) params.category = category;

    let request;
    if (coords) {
      params.lat = coords.lat;
      params.lng = coords.lng;
      request = api.get("/providers/nearby", { params });
    } else {
      if (city) params.city = city;
      request = api.get("/providers", { params });
    }

    request
      .then((res) => {
        const list = res.data.providers;
        setProviders(list);
        setTotal(res.data.total ?? null);
        setPages(
          res.data.pages ?? (list.length === PAGE_SIZE ? page + 1 : page),
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load providers"),
      )
      .finally(() => setLoading(false));
  }, [category, city, page, coords]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCoords(null);
    setPage(1);
    setCity(cityInput.trim());
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPage(1);
        setCity("");
        setCityInput("");
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  const selectCategory = (id) => {
    setPage(1);
    setCategory(id);
  };

  const clearAll = () => {
    setCategory("");
    setCity("");
    setCityInput("");
    setCoords(null);
    setPage(1);
  };

  const hasFilters = category || city || coords;
  const activeCategory = categories.find((c) => c._id === category);

  return (
    <div className="-mx-4 -mt-8 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-4 pb-20 pt-14 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" /> Verified local professionals
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            Find the right expert for any job
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100 sm:text-lg">
            Compare ratings, prices and real-time availability. Book in minutes.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-indigo-950/30 sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-3 rounded-xl px-3">
              <MapPin className="h-5 w-5 shrink-0 text-indigo-500" />
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder={
                  coords
                    ? "Using your current location"
                    : "Search by city, e.g. Hyderabad"
                }
                disabled={!!coords}
                className="w-full bg-transparent py-3 text-sm text-[#172033] outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              {cityInput && (
                <button
                  type="button"
                  onClick={() => setCityInput("")}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  coords
                    ? () => {
                        setCoords(null);
                        setPage(1);
                      }
                    : useMyLocation
                }
                disabled={locating}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60 sm:flex-none"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {coords ? "Clear location" : "Near me"}
              </button>
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:flex-none"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-6xl space-y-6 px-4">
        {" "}
        {/* Category chips */}
        {/* Category chips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Browse by service
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] md:flex-wrap md:overflow-visible md:pb-0">
            <button
              onClick={() => selectCategory("")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                !category
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <Zap className="h-4 w-4" /> All services
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => selectCategory(c._id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                  category === c._id
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        {/* Results header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">
              {activeCategory ? activeCategory.name : "All providers"}
              {total !== null && !loading && (
                <span className="ml-2 text-base font-medium text-slate-500">
                  ({total})
                </span>
              )}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2">
              {city && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <MapPin className="h-3 w-3" /> {city}
                </span>
              )}
              {coords && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <Navigation className="h-3 w-3" /> Nearest first
                </span>
              )}
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
            >
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </div>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {/* Results */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No providers found"
            text={
              coords
                ? "No providers with a saved location were found near you. Try a different category or search by city."
                : "Try a different city or category to see more results."
            }
            action={
              hasFilters && (
                <button
                  onClick={clearAll}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Reset filters
                </button>
              )
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <ProviderCard key={p._id} provider={p} />
            ))}
          </div>
        )}
        {!loading && providers.length > 0 && (
          <Pagination page={page} pages={pages} onChange={setPage} />
        )}
      </div>
    </div>
  );
}

export default Providers;
