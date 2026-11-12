import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  UserCog,
} from "lucide-react";
import api from "../api/axios";

const DAYS = [
  { value: 0, short: "Sun", long: "Sunday" },
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
];

const PRESETS = [
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekends", days: [0, 6] },
];

const hourLabel = (h) => {
  const hour = h % 24;
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
};

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#172033] outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

function ProviderAvailability() {
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/availability/me")
      .then((res) => {
        const a = res.data.availability;
        setWorkingDays(a.workingDays);
        setStartHour(a.startHour);
        setEndHour(a.endHour);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "";
        if (err.response?.status === 404 && /profile/i.test(message))
          setNeedsProfile(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (d) =>
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );

  const invalid =
    Number(startHour) >= Number(endHour) || workingDays.length === 0;
  const slotsPerDay = Math.max(0, Number(endHour) - Number(startHour));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (workingDays.length === 0) {
      setError("Select at least one working day");
      return;
    }
    if (Number(startHour) >= Number(endHour)) {
      setError("Start time must be before end time");
      return;
    }
    setSaving(true);
    try {
      await api.put("/availability", {
        workingDays,
        startHour: Number(startHour),
        endHour: Number(endHour),
      });
      setSuccess("Availability saved. Customers can now book these slots.");
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not save availability";
      if (err.response?.status === 404 && /profile/i.test(message))
        setNeedsProfile(true);
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;

  if (needsProfile) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <UserCog className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-[#172033]">
          Create your profile first
        </h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Availability is linked to your provider profile. Set up your service
          details, then come back here.
        </p>
        <Link to="/provider/profile" className="btn-primary mt-5">
          Create profile
        </Link>
      </div>
    );
  }

  const summaryDays = DAYS.filter((d) => workingDays.includes(d.value))
    .map((d) => d.short)
    .join(", ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#172033]">Availability</h1>
        <p className="mt-1 text-slate-500">
          Choose when customers can book you. Slots are one hour long.
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
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <h2 className="font-bold text-[#172033]">Working days</h2>
              </div>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setWorkingDays(p.days)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => {
                const active = workingDays.includes(d.value);
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => toggleDay(d.value)}
                    aria-pressed={active}
                    title={d.long}
                    className={`rounded-xl border py-3 text-sm font-bold transition ${
                      active
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-[#172033]">Working hours</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-[#172033]">
                  Start time
                </span>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className={field}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-[#172033]">
                  End time
                </span>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className={field}
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {h === 24 ? "12:00 AM (midnight)" : hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {Number(startHour) >= Number(endHour) && (
              <p className="mt-3 text-sm font-medium text-red-600">
                End time must be after start time.
              </p>
            )}
          </section>

          <button
            disabled={saving || invalid}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save availability"}
          </button>
        </form>

        {/* Preview */}
        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Summary
          </p>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">Days</p>
              <p className="font-bold text-[#172033]">
                {summaryDays || "None selected"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Hours</p>
              <p className="font-bold text-[#172033]">
                {hourLabel(Number(startHour))} -{" "}
                {Number(endHour) === 24
                  ? "12:00 AM"
                  : hourLabel(Number(endHour))}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 px-4 py-3">
              <p className="text-2xl font-extrabold text-indigo-700">
                {invalid ? 0 : slotsPerDay}
              </p>
              <p className="text-xs font-semibold text-indigo-600">
                bookable slots per working day
              </p>
            </div>
            {!invalid && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: Math.min(slotsPerDay, 8) }, (_, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                  >
                    {String(Number(startHour) + i).padStart(2, "0")}:00
                  </span>
                ))}
                {slotsPerDay > 8 && (
                  <span className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400">
                    +{slotsPerDay - 8} more
                  </span>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProviderAvailability;
