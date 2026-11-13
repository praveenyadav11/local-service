import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  StickyNote,
  XCircle,
  Hourglass,
  BadgeCheck,
  Ban,
} from "lucide-react";
import ContactActions from "./ContactActions";
const STATUS = {
  pending: {
    label: "Pending",
    icon: Hourglass,
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    icon: BadgeCheck,
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
    bar: "bg-sky-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    cls: "bg-red-50 text-red-700 ring-red-200",
    bar: "bg-red-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
    bar: "bg-slate-300",
  },
};

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

const formatDate = (str) => {
  const d = new Date(`${str}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


function BookingCard({ booking, role, onStatusChange, busy, children }) {
  const actions = [];

  if (role === "provider") {
    if (booking.status === "pending") {
      actions.push({
        label: "Confirm",
        status: "confirmed",
        cls: "btn-primary",
      });
      actions.push({ label: "Reject", status: "rejected", cls: "btn-danger" });
    }
    if (booking.status === "confirmed") {
      actions.push({
        label: "Mark completed",
        status: "completed",
        cls: "btn-primary",
      });
      actions.push({
        label: "Cancel",
        status: "cancelled",
        cls: "btn-secondary",
      });
    }
  }

  if (
    role === "customer" &&
    ["pending", "confirmed"].includes(booking.status)
  ) {
    actions.push({
      label: "Cancel booking",
      status: "cancelled",
      cls: "btn-secondary",
    });
  }

  const who =
    role === "customer"
      ? booking.provider?.user?.name || "Provider"
      : booking.customer?.name || "Customer";
  const sub =
    role === "customer" ? booking.provider?.category?.name : "Customer";
  const st = STATUS[booking.status] || STATUS.pending;
  const StatusIcon = st.icon;
  const hasFooter = actions.length > 0 || children;
  const contactPhone =
    role === "customer"
      ? booking.provider?.user?.phone
      : booking.customer?.phone;


  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${st.bar}`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${gradientFor(
                who,
              )} text-lg font-extrabold text-white shadow`}
            >
              {who[0]?.toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-bold text-[#172033]">{who}</h2>
              <p className="text-sm text-slate-500">{sub}</p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${st.cls}`}
          >
            <StatusIcon className="h-3.5 w-3.5" /> {st.label}
          </span>
        </div>

        <div className="mt-4 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />{" "}
            {formatDate(booking.date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-indigo-500" />{" "}
            {booking.startTime} - {booking.endTime}
          </p>
          <p className="flex items-start gap-2 sm:col-span-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />{" "}
            {booking.address}
          </p>
          {booking.notes && (
            <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-500 sm:col-span-2">
              <StickyNote className="mt-0.5 h-4 w-4 shrink-0" /> {booking.notes}
            </p>
          )}
        </div>

        {contactPhone ? (
          <div className="mt-4">
            <ContactActions phone={contactPhone} name={who} />
          </div>
        ) : (
          booking.status === "pending" && (
            <p className="mt-4 text-xs text-slate-400">
              Contact details are shared once the booking is confirmed.
            </p>
          )
        )}

      </div>

      {hasFooter && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 pl-6">
          {actions.map((a) => (
            <button
              key={a.status}
              disabled={busy}
              onClick={() => onStatusChange(booking._id, a.status)}
              className={a.cls}
            >
              {a.label}
            </button>
          ))}
          {children}
        </div>
      )}
    </article>
  );
}

export default BookingCard;
