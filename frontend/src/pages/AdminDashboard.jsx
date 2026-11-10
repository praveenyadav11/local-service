import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const { user: me } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [providerId, setProviderId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(() => {
    api
      .get("/admin/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load analytics"),
      );
  }, []);

  const loadUsers = useCallback(() => {
    const params = { page, limit: 10 };
    if (role) params.role = role;
    api
      .get("/admin/users", { params })
      .then((res) => {
        setUsers(res.data.users);
        setPages(res.data.pages || 1);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load users"),
      );
  }, [page, role]);

  useEffect(loadAnalytics, [loadAnalytics]);
  useEffect(loadUsers, [loadUsers]);

  const toggleActive = async (u) => {
    setError("");
    try {
      await api.patch(`/admin/users/${u._id}/active`, {
        isActive: u.isActive === false,
      });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update user");
    }
  };

  const setVerified = async (isVerified) => {
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/providers/${providerId.trim()}/verify`, {
        isVerified,
      });
      setMessage(`Provider ${isVerified ? "verified" : "unverified"}`);
      loadAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update provider");
    }
  };

  const o = analytics?.overview;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {o && (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={o.users.total} />
            <StatCard
              label="Providers (verified)"
              value={`${o.providers.total} (${o.providers.verified})`}
            />
            <StatCard label="Bookings" value={o.bookings.total} />
            <StatCard label="Revenue" value={`₹${o.revenue.total}`} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-2">Bookings by status</h2>
              {Object.entries(o.bookings.byStatus).map(([s, c]) => (
                <p key={s} className="text-sm flex justify-between">
                  <span>{s}</span>
                  <span>{c}</span>
                </p>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-2">Top providers</h2>
              {analytics.topProviders.length === 0 && (
                <p className="text-sm text-slate-500">
                  No completed bookings yet.
                </p>
              )}
              {analytics.topProviders.map((p) => (
                <p key={p._id} className="text-sm flex justify-between">
                  <span>
                    {p.name} ({p.city})
                  </span>
                  <span>{p.completedBookings}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Bookings per day</h2>
            {analytics.bookingsPerDay.length === 0 && (
              <p className="text-sm text-slate-500">No recent bookings.</p>
            )}
            {analytics.bookingsPerDay.map((d) => (
              <div key={d.date} className="flex items-center gap-2 text-sm">
                <span className="w-24">{d.date}</span>
                <div
                  className="bg-blue-500 h-3 rounded"
                  style={{ width: `${d.count * 24}px` }}
                />
                <span>{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <h2 className="font-semibold">Provider verification</h2>
        <input
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          placeholder="Provider profile id"
          className="w-full border rounded px-3 py-2"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setVerified(true)}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Verify
          </button>
          <button
            onClick={() => setVerified(false)}
            className="bg-slate-600 text-white px-3 py-1 rounded"
          >
            Unverify
          </button>
        </div>
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Users</h2>
          <select
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between border-t pt-2 text-sm"
          >
            <div>
              <p className="font-medium">
                {u.name} <span className="text-slate-500">({u.role})</span>
              </p>
              <p className="text-slate-500">{u.email}</p>
            </div>
            {u._id !== me.id && (
              <button
                onClick={() => toggleActive(u)}
                className={`${u.isActive === false ? "bg-green-600" : "bg-red-600"} text-white px-3 py-1 rounded`}
              >
                {u.isActive === false ? "Activate" : "Deactivate"}
              </button>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
