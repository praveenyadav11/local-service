import { useState } from "react";
import { useSocket } from "../context/SocketContext";

function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl z-10">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-3 text-sm text-slate-500">No notifications.</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`px-3 py-2 text-sm border-b border-slate-100 text-slate-700 ${n.isRead ? "" : "bg-brand-50"}`}
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
