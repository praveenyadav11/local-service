import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CheckCircle2,
  Hourglass,
  ListChecks,
  Plus,
  Star,
  Wallet,
} from "lucide-react";
import useBookings from "../hooks/useBookings";
import StatTile from "../components/StatTile";
import BookingList from "../components/BookingList";
import ReviewForm from "../components/ReviewForm";
import PayButton from "../components/PayButton";
import api from "../api/axios";

// function StatTile({ icon: Icon, label, value, tone }) {
//   return (
//     <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//       <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
//         <Icon className="h-6 w-6" />
//       </span>
//       <div>
//         <p className="text-2xl font-extrabold leading-none text-[#172033]">
//           {value ?? "-"}
//         </p>
//         <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
//       </div>
//     </div>
//   );
// }

function MyBookings() {
  const data = useBookings("/bookings/my");
  const [paidIds, setPaidIds] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [reviewed, setReviewed] = useState([]);
  const [stats, setStats] = useState({});

  const loadPayments = () => {
    api
      .get("/payments/my", { params: { limit: 50 } })
      .then((res) => setPaidIds(res.data.payments.map((p) => p.booking?._id)))
      .catch(() => {});
  };

  useEffect(loadPayments, []);

  useEffect(() => {
    const count = (status) =>
      api
        .get("/bookings/my", {
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
  }, [data.bookings]);

  const renderExtra = (b) => {
    const paid = paidIds.includes(b._id);
    return (
      <>
        {b.status === "confirmed" && !paid && (
          <PayButton bookingId={b._id} onDone={loadPayments} />
        )}
        {paid && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> Paid
          </span>
        )}
        {b.status === "completed" &&
          !reviewed.includes(b._id) &&
          reviewing !== b._id && (
            <button
              onClick={() => setReviewing(b._id)}
              className="btn-secondary gap-1.5"
            >
              <Star className="h-4 w-4 text-amber-500" /> Leave a review
            </button>
          )}
        {b.status === "completed" && reviewing === b._id && (
          <ReviewForm
            bookingId={b._id}
            onDone={(submitted) => {
              if (submitted) setReviewed((prev) => [...prev, b._id]);
              setReviewing(null);
            }}
          />
        )}
        {reviewed.includes(b._id) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Review
            submitted
          </span>
        )}
      </>
    );
  };

  const summary = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        icon={ListChecks}
        label="Total bookings"
        value={stats.total}
        tone="bg-indigo-50 text-indigo-600"
      />
      <StatTile
        icon={Hourglass}
        label="Awaiting confirmation"
        value={stats.pending}
        tone="bg-amber-50 text-amber-600"
      />
      <StatTile
        icon={CalendarCheck}
        label="Upcoming confirmed"
        value={stats.confirmed}
        tone="bg-sky-50 text-sky-600"
      />
      <StatTile
        icon={Wallet}
        label="Completed services"
        value={stats.completed}
        tone="bg-emerald-50 text-emerald-600"
      />
    </div>
  );

  return (
    <BookingList
      title="My bookings"
      subtitle="Track, pay and review your services."
      role="customer"
      data={data}
      renderExtra={renderExtra}
      summary={summary}
      action={
        <Link to="/providers" className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Book a service
        </Link>
      }
    />
  );
}

export default MyBookings;
