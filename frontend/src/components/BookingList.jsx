import { CalendarX } from "lucide-react";
import { Link } from "react-router-dom";
import BookingCard from "./BookingCard";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

function BookingList({
  title,
  subtitle,
  role,
  data,
  renderExtra,
  summary,
  action,
}) {
  const {
    bookings,
    status,
    setStatus,
    page,
    setPage,
    pages,
    loading,
    error,
    busy,
    changeStatus,
  } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#172033]">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>

      {summary}

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setPage(1);
              setStatus(t.value);
            }}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              status === t.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/4 rounded bg-slate-200" />
                </div>
              </div>
              <div className="mt-6 h-3 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={status ? `No ${status} bookings` : "No bookings yet"}
          text={
            role === "customer"
              ? "Find a trusted provider and book your first service in minutes."
              : "New booking requests from customers will appear here."
          }
          action={
            role === "customer" && (
              <Link to="/providers" className="btn-primary">
                Find a provider
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              role={role}
              busy={busy}
              onStatusChange={changeStatus}
            >
              {renderExtra && renderExtra(b)}
            </BookingCard>
          ))}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <Pagination page={page} pages={pages} onChange={setPage} />
      )}
    </div>
  );
}

export default BookingList;
