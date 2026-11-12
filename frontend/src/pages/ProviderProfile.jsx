import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Save,
  Star,
  Wrench,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const label = "text-sm font-semibold text-[#172033]";
const field =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#172033] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function Section({ icon: Icon, title, text, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-bold text-[#172033]">{title}</h2>
          {text && <p className="text-sm text-slate-500">{text}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ProviderProfile() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [exists, setExists] = useState(false);
  const [verified, setVerified] = useState(false);
  const [form, setForm] = useState({
    category: "",
    bio: "",
    experienceYears: 0,
    hourlyRate: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
    api
      .get("/providers/profile/me")
      .then((res) => {
        const p = res.data.profile;
        setExists(true);
        setVerified(!!p.isVerified);
        setForm({
          category: p.category?._id || "",
          bio: p.bio || "",
          experienceYears: p.experienceYears,
          hourlyRate: p.hourlyRate,
          city: p.city,
          latitude: p.location?.coordinates?.[1] ?? "",
          longitude: p.location?.coordinates?.[0] ?? "",
        });
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
      },
      () => {
        setError(
          "Could not get your location. Allow location access and try again.",
        );
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const hasLat = form.latitude !== "";
    const hasLng = form.longitude !== "";
    if (hasLat !== hasLng) {
      setError("Enter both latitude and longitude, or leave both empty");
      return;
    }

    const body = {
      category: form.category,
      bio: form.bio,
      experienceYears: Number(form.experienceYears),
      hourlyRate: Number(form.hourlyRate),
      city: form.city.trim(),
    };
    if (hasLat && hasLng) {
      body.latitude = Number(form.latitude);
      body.longitude = Number(form.longitude);
    }

    setSaving(true);
    try {
      if (exists) {
        await api.put("/providers/profile", body);
      } else {
        await api.post("/providers/profile", body);
        setExists(true);
      }
      setSuccess("Profile saved successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid animate-pulse gap-6 lg:grid-cols-3">
        <div className="h-96 rounded-2xl bg-slate-200 lg:col-span-2" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  const categoryName = categories.find((c) => c._id === form.category)?.name;
  const hasLocation = form.latitude !== "" && form.longitude !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#172033]">
          {exists ? "Business profile" : "Create your profile"}
        </h1>
        <p className="mt-1 text-slate-500">
          This is what customers see when they browse providers.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </span>
          <Link
            to="/provider/availability"
            className="inline-flex items-center gap-1 font-bold underline"
          >
            Next: set your availability <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <Section
            icon={Wrench}
            title="Service"
            text="What you offer and what you charge."
          >
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className={label}>Category</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={field}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="capitalize">
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className={label}>Hourly rate</span>
                  <span className="relative block">
                    <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      name="hourlyRate"
                      type="number"
                      min="0"
                      required
                      value={form.hourlyRate}
                      onChange={handleChange}
                      placeholder="500"
                      className={`${field} pl-9`}
                    />
                  </span>
                </label>
                <label className="block space-y-1.5">
                  <span className={label}>Years of experience</span>
                  <input
                    name="experienceYears"
                    type="number"
                    min="0"
                    max="60"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className={field}
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="flex justify-between">
                  <span className={label}>About you</span>
                  <span className="text-xs text-slate-400">
                    {form.bio.length}/500
                  </span>
                </span>
                <textarea
                  name="bio"
                  rows={4}
                  maxLength={500}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Describe your skills, experience and the services you offer"
                  className={field}
                />
              </label>
            </div>
          </Section>

          <Section
            icon={MapPin}
            title="Location"
            text="Used for city search and the Near me feature."
          >
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className={label}>City</span>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                  className={field}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className={label}>Latitude</span>
                  <input
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="17.385"
                    className={field}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className={label}>Longitude</span>
                  <input
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="78.4867"
                    className={field}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="btn-secondary gap-2"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Use my current location
              </button>
              <p className="text-xs text-slate-400">
                Optional. Without coordinates you still appear in city search,
                but not in Near me results.
              </p>
            </div>
          </Section>

          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : exists ? "Save changes" : "Create profile"}
          </button>
        </form>

        {/* Live preview */}
        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-extrabold text-white shadow-md">
                {user?.name?.[0]?.toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-bold text-[#172033]">
                    {user?.name}
                  </h3>
                  {verified && (
                    <BadgeCheck className="h-5 w-5 shrink-0 fill-indigo-600 text-white" />
                  )}
                </div>
                <p className="text-sm font-medium capitalize text-indigo-600">
                  {categoryName || "Choose a category"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                  <Star className="h-4 w-4 text-slate-300" /> No reviews yet
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <MapPin className="h-3.5 w-3.5" /> {form.city || "Your city"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Briefcase className="h-3.5 w-3.5" />{" "}
                {form.experienceYears || 0} yrs exp.
              </span>
              {hasLocation && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Navigation className="h-3.5 w-3.5" /> Near me enabled
                </span>
              )}
            </div>

            <p className="mt-4 line-clamp-3 text-sm text-slate-600">
              {form.bio || "Your bio will appear here."}
            </p>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">Starting at</p>
              <p className="text-xl font-extrabold text-[#172033]">
                ₹{form.hourlyRate || 0}
                <span className="text-sm font-medium text-slate-500">/hr</span>
              </p>
            </div>
          </div>

          {exists && !verified && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
              Verification pending. An admin will review your profile and add
              the Verified badge.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProviderProfile;
