import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  LogIn,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  UserX,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AddressInput from "../components/AddressInput";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-fuchsia-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];
const gradientFor = (name = "") =>
  GRADIENTS[
    [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length
  ];

const toDateString = (d) => d.toLocaleDateString("en-CA");
const todayString = () => toDateString(new Date());

const nextDays = (count = 7) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: toDateString(d),
      weekday:
        i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 text-lg font-extrabold text-[#172033]">{value}</p>
    </div>
  );
}

function Stars({ value }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="h-64 rounded-2xl bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}

function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [date, setDate] = useState(todayString());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/providers/${id}`)
      .then((res) => setProvider(res.data.provider))
      .catch(() => navigate("/providers"));
    api
      .get(`/reviews/provider/${id}`)
      .then((res) => setReviews(res.data.reviews))
      .catch(() => {});
  }, [id, navigate]);

  const loadSlots = () => {
    setSlotsMessage("");
    setSlotsLoading(true);
    api
      .get(`/providers/${id}/slots`, { params: { date } })
      .then((res) => {
        setSlots(res.data.slots);
        if (res.data.slots.length === 0)
          setSlotsMessage("No slots available on this date.");
      })
      .catch((err) => {
        setSlots([]);
        setSlotsMessage(err.response?.data?.message || "Could not load slots");
      })
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    setSelected("");
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        providerId: id,
        date,
        startTime: selected,
        address,
        notes,
      });
      setSuccess("Booking requested! The provider will confirm soon.");
      setSelected("");
      setAddress("");
      setCoords(null);
      setNotes("");
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      loadSlots();
    } finally {
      setSubmitting(false);
    }
  };

  if (!provider) return <DetailSkeleton />;

  const name = provider.user?.name || "Provider";
  const hasRating = provider.ratingCount > 0;
  const days = nextDays(7);
  const selectedSlot = slots.find((s) => s.startTime === selected);

  return (
    <div className="space-y-6">
      <Link
        to="/providers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to providers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile header */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div
                  className={`grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradientFor(
                    name,
                  )} text-4xl font-extrabold text-white shadow-lg ring-4 ring-white`}
                >
                  {name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-[#172033]">
                      {name}
                    </h1>
                    {provider.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        <BadgeCheck className="h-4 w-4 fill-indigo-600 text-white" />{" "}
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-indigo-600">
                    {provider.category?.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {provider.city}
                    </span>
                    {hasRating ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <b className="text-[#172033]">
                          {provider.ratingAverage}
                        </b>{" "}
                        ({provider.ratingCount} reviews)
                      </span>
                    ) : (
                      <span>No reviews yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={IndianRupee}
                  label="Rate"
                  value={`₹${provider.hourlyRate}/hr`}
                />
                <Stat
                  icon={Briefcase}
                  label="Experience"
                  value={`${provider.experienceYears} yrs`}
                />
                <Stat
                  icon={Star}
                  label="Rating"
                  value={hasRating ? provider.ratingAverage : "--"}
                />
                <Stat
                  icon={MessageSquare}
                  label="Reviews"
                  value={provider.ratingCount || 0}
                />
              </div>
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#172033]">About</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">
              {provider.bio || "This provider has not added a bio yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                <ShieldCheck className="h-4 w-4" /> Secure online or cash
                payment
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                <Clock className="h-4 w-4" /> One-hour slots
              </span>
            </div>
          </section>

          {/* Reviews */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#172033]">
                Customer reviews
              </h2>
              {hasRating && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                  {provider.ratingAverage} / 5
                </span>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-xl bg-slate-50 py-10 text-center">
                <MessageSquare className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-500">
                  No reviews yet
                </p>
                <p className="text-xs text-slate-400">
                  Reviews appear after completed bookings.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {r.customer?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#172033]">
                        {r.customer?.name || "Customer"}
                      </p>
                      <Stars value={r.rating} />
                      {r.comment && (
                        <p className="mt-1 text-sm text-slate-600">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Booking panel */}
        <aside className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 lg:sticky lg:top-24">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Starting at
              </p>
              <p className="text-3xl font-extrabold text-[#172033]">
                ₹{provider.hourlyRate}
                <span className="text-base font-medium text-slate-500">
                  /hr
                </span>
              </p>
            </div>
            {hasRating && (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#172033]">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{" "}
                {provider.ratingAverage}
              </span>
            )}
          </div>

          {/* Step 1: date */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#172033]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-xs text-white">
                1
              </span>
              Choose a date
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
              {days.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDate(d.value)}
                  className={`flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2 transition ${
                    date === d.value
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  <span className="text-xs font-semibold">{d.weekday}</span>
                  <span className="text-lg font-extrabold leading-tight">
                    {d.day}
                  </span>
                  <span className="text-[10px] font-medium opacity-80">
                    {d.month}
                  </span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <input
                type="date"
                value={date}
                min={todayString()}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="w-full bg-transparent text-[#172033] outline-none"
              />
            </label>
          </div>

          {/* Step 2: time */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#172033]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-xs text-white">
                2
              </span>
              Pick a time
            </h3>

            {slotsLoading ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-10 animate-pulse rounded-xl bg-slate-200"
                  />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                <Clock className="h-4 w-4 shrink-0" />{" "}
                {slotsMessage || "No slots available."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <button
                    type="button"
                    key={s.startTime}
                    onClick={() => setSelected(s.startTime)}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                      selected === s.startTime
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {s.startTime} - {s.endTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: details */}
          {!user ? (
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <LogIn className="h-4 w-4" /> Log in as a customer to book
            </Link>
          ) : user.role !== "customer" ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm font-medium text-amber-800">
              <UserX className="h-4 w-4 shrink-0" /> Only customer accounts can
              book services.
            </div>
          ) : (
            selected && (
              <form onSubmit={handleBook} className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#172033]">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-600 text-xs text-white">
                    3
                  </span>
                  Service details
                </h3>
                <AddressInput
                  value={address}
                  onChange={setAddress}
                  coords={coords}
                  onCoords={setCoords}
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for the provider (optional)"
                  maxLength={300}
                  rows={2}
                  className="input"
                />

                <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Date</span>
                    <b className="text-[#172033]">{date}</b>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Time</span>
                    <b className="text-[#172033]">
                      {selectedSlot
                        ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                        : selected}
                    </b>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-slate-600">
                    <span>Total (1 hour)</span>
                    <b className="text-base text-[#172033]">
                      ₹{provider.hourlyRate}
                    </b>
                  </div>
                </div>

                <button
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Booking...
                    </>
                  ) : (
                    "Request booking"
                  )}
                </button>
                <p className="text-center text-xs text-slate-400">
                  You pay after the provider confirms your request.
                </p>
              </form>
            )
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="space-y-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
              </p>
              <Link to="/my-bookings" className="font-bold underline">
                View my bookings
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProviderDetail;
