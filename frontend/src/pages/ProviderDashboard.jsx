import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CalendarCheck,
  CheckCircle2,
  Inbox,
  ListChecks,
  Star,
  UserCog,
} from "lucide-react";
import useBookings from "../hooks/useBookings";
import BookingList from "../components/BookingList";
import StatTile from "../components/StatTile";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProviderDashboard() {
  const { user } = useAuth();
  const data = useBookings("/bookings/provider");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [received, setReceived] = useState([]);
  const [msg, setMsg] = useState("");

  const profileMissing = /provider profile/i.test(data.error || "");

  useEffect(() => {
    api
      .get("/providers/profile/me")
      .then((res) => setProfile(res.data.profile))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    if (profileMissing) return;
    const count = (status) =>
      api
        .get("/bookings/provider", {
          params: status ? { status, limit: 1 } : { limit: 1 },
        })
        .then((res) => res.data.total);

    Promise.all([
      count(""),
      count("pending"),
      count("confirmed"),
      count("completed"),
    ])
      .then(([total, pending, confirmed, completed]) =>
        setStats({ total, pending, confirmed, completed }),
      )
      .catch(() => {});
  }, [data.bookings, profileMissing]);

  const markReceived = async (bookingId) => {
    setMsg("");
    try {
      await api.patch(`/payments/cash/${bookingId}/received`);
      setReceived((prev) => [...prev, bookingId]);
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not confirm cash");
    }
  };

  const renderExtra = (b) => {
    if (b.payment?.status === "paid" || received.includes(b._id)) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <CheckCircle2 className="h-4 w-4" /> Paid (
          {b.payment?.method || "cash"})
        </span>
      );
    }
    if (b.payment?.method === "cash") {
      return (
        <button
          onClick={() => markReceived(b._id)}
          className="btn-secondary gap-1.5"
        >
          <Banknote className="h-4 w-4 text-emerald-600" /> Cash received
        </button>
      );
    }
    return null;
  };

  const header = (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-extrabold text-white shadow">
        {user?.name?.[0]?.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-xl font-extrabold text-[#172033]">
            Welcome back, {user?.name}
          </h2>
          {profile?.isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              <BadgeCheck className="h-4 w-4 fill-indigo-600 text-white" />{" "}
              Verified
            </span>
          ) : (
            profile && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                Verification pending
              </span>
            )
          )}
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
          {profile?.category?.name && <span>{profile.category.name}</span>}
          {profile && <span>₹{profile.hourlyRate}/hr</span>}
          {profile?.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <b className="text-[#172033]">{profile.ratingAverage}</b> (
              {profile.ratingCount} reviews)
            </span>
          ) : (
            profile && <span>No reviews yet</span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/provider/availability" className="btn-secondary gap-2">
          <CalendarClock className="h-4 w-4" /> Availability
        </Link>
        <Link to="/provider/profile" className="btn-primary gap-2">
          <UserCog className="h-4 w-4" /> Edit profile
        </Link>
      </div>
    </div>
  );

  const setupCard = (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-700">
        <AlertCircle className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <h3 className="font-bold text-[#172033]">
          Finish setting up your provider profile
        </h3>
        <p className="text-sm text-slate-600">
          Customers can't find or book you until you add your service, rate and
          availability.
        </p>
      </div>
      <Link to="/provider/profile" className="btn-primary">
        Create profile
      </Link>
    </div>
  );

  const summary = (
    <div className="space-y-4">
      {msg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {msg}
        </div>
      )}
      {profileMissing ? (
        setupCard
      ) : (
        <>
          {header}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              icon={ListChecks}
              label="Total bookings"
              value={stats.total}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatTile
              icon={Inbox}
              label="New requests"
              value={stats.pending}
              tone="bg-amber-50 text-amber-600"
              hint={stats.pending > 0 ? "Needs your response" : undefined}
            />
            <StatTile
              icon={CalendarCheck}
              label="Confirmed jobs"
              value={stats.confirmed}
              tone="bg-sky-50 text-sky-600"
            />
            <StatTile
              icon={CheckCircle2}
              label="Completed jobs"
              value={stats.completed}
              tone="bg-emerald-50 text-emerald-600"
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <BookingList
      title="Provider dashboard"
      subtitle="Manage requests, jobs and payments."
      role="provider"
      data={{ ...data, error: profileMissing ? "" : data.error }}
      renderExtra={renderExtra}
      summary={summary}
    />
  );
}

export default ProviderDashboard;
