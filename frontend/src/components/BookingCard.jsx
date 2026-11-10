const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-700",
  completed: "bg-green-100 text-green-700",
};

function BookingCard({ booking, role, onStatusChange, busy, children }) {
  const actions = [];

  if (role === "provider") {
    if (booking.status === "pending") {
      actions.push({
        label: "Confirm",
        status: "confirmed",
        style: "bg-blue-600",
      });
      actions.push({
        label: "Reject",
        status: "rejected",
        style: "bg-red-600",
      });
    }
    if (booking.status === "confirmed") {
      actions.push({
        label: "Complete",
        status: "completed",
        style: "bg-green-600",
      });
      actions.push({
        label: "Cancel",
        status: "cancelled",
        style: "bg-slate-600",
      });
    }
  }

  if (
    role === "customer" &&
    ["pending", "confirmed"].includes(booking.status)
  ) {
    actions.push({
      label: "Cancel",
      status: "cancelled",
      style: "bg-slate-600",
    });
  }

  const who =
    role === "customer"
      ? `${booking.provider?.user?.name || "Provider"} · ${booking.provider?.category?.name || ""}`
      : booking.customer?.name || "Customer";

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{who}</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLES[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
      <p className="text-sm">
        {booking.date} · {booking.startTime} - {booking.endTime}
      </p>
      <p className="text-sm text-slate-600">{booking.address}</p>
      {booking.notes && (
        <p className="text-sm text-slate-500">{booking.notes}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {actions.map((a) => (
          <button
            key={a.status}
            disabled={busy}
            onClick={() => onStatusChange(booking._id, a.status)}
            className={`${a.style} text-white text-sm px-3 py-1 rounded disabled:opacity-50`}
          >
            {a.label}
          </button>
        ))}
        {children}
      </div>
    </div>
  );
}

export default BookingCard;
