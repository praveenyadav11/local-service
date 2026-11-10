import BookingCard from "./BookingCard";

const STATUSES = [
  "",
  "pending",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
];

function BookingList({ title, role, data, renderExtra }) {
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>

      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        className="border rounded px-3 py-2 bg-white"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s || "All statuses"}
          </option>
        ))}
      </select>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-500">No bookings found.</p>
      ) : (
        <div className="space-y-3">
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

      <div className="flex items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default BookingList;
