import { useCallback, useEffect, useState } from 'react';
import {
  BadgeCheck, CalendarDays, IndianRupee, Loader2, ShieldCheck, ShieldOff,
  Trophy, UserCheck, UserX, Users, Wrench, CalendarCheck, Star, SearchX,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatTile from '../components/StatTile';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const STATUS_COLORS = {
  pending: { bar: 'bg-amber-400', dot: 'bg-amber-400' },
  confirmed: { bar: 'bg-sky-500', dot: 'bg-sky-500' },
  completed: { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  rejected: { bar: 'bg-red-400', dot: 'bg-red-400' },
  cancelled: { bar: 'bg-slate-300', dot: 'bg-slate-300' },
};

const ROLE_TABS = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customers' },
  { value: 'provider', label: 'Providers' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_BADGE = {
  customer: 'bg-sky-50 text-sky-700',
  provider: 'bg-violet-50 text-violet-700',
  admin: 'bg-indigo-50 text-indigo-700',
};

const formatJoined = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Card({ title, icon: Icon, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#172033]">
          {Icon && <Icon className="h-5 w-5 text-indigo-600" />} {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AdminDashboard() {
  const { user: me } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  const [providers, setProviders] = useState([]);
  const [provPage, setProvPage] = useState(1);
  const [provPages, setProvPages] = useState(1);
  const [provLoading, setProvLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const [providerId, setProviderId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(() => {
    api
      .get('/admin/analytics')
      .then((res) => setAnalytics(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'));
  }, []);

  const loadUsers = useCallback(() => {
    setUsersLoading(true);
    const params = { page, limit: 8 };
    if (role) params.role = role;
    api
      .get('/admin/users', { params })
      .then((res) => {
        setUsers(res.data.users);
        setPages(res.data.pages || 1);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, [page, role]);

  const loadProviders = useCallback(() => {
    setProvLoading(true);
    api
      .get('/providers', { params: { page: provPage, limit: 5 } })
      .then((res) => {
        setProviders(res.data.providers);
        setProvPages(res.data.pages || 1);
      })
      .catch(() => {})
      .finally(() => setProvLoading(false));
  }, [provPage]);

  useEffect(loadAnalytics, [loadAnalytics]);
  useEffect(loadUsers, [loadUsers]);
  useEffect(loadProviders, [loadProviders]);

  const toggleActive = async (u) => {
    const deactivating = u.isActive !== false;
    if (deactivating && !window.confirm(`Deactivate ${u.name}? They will be unable to log in.`)) return;
    setError('');
    try {
      await api.patch(`/admin/users/${u._id}/active`, { isActive: !deactivating });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update user');
    }
  };

  const setVerified = async (id, isVerified) => {
    setError('');
    setMessage('');
    setBusyId(id);
    try {
      await api.patch(`/admin/providers/${id}/verify`, { isVerified });
      setMessage(`Provider ${isVerified ? 'verified' : 'unverified'}`);
      setProviders((prev) => prev.map((p) => (p._id === id ? { ...p, isVerified } : p)));
      loadAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update provider');
    } finally {
      setBusyId('');
    }
  };

  const o = analytics?.overview;
  const statusEntries = o ? Object.entries(o.bookings.byStatus) : [];
  const statusTotal = statusEntries.reduce((s, [, c]) => s + c, 0) || 1;
  const perDay = analytics?.bookingsPerDay || [];
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#172033]">Admin dashboard</h1>
        <p className="mt-1 text-slate-500">Platform overview, user management and provider verification.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      )}

      {/* KPI tiles */}
      {!o ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            icon={Users}
            label="Total users"
            value={o.users.total}
            tone="bg-indigo-50 text-indigo-600"
            hint={`${o.users.byRole.customer || 0} customers`}
          />
          <StatTile
            icon={Wrench}
            label="Providers"
            value={o.providers.total}
            tone="bg-violet-50 text-violet-600"
            hint={`${o.providers.verified} verified`}
          />
          <StatTile
            icon={CalendarCheck}
            label="Total bookings"
            value={o.bookings.total}
            tone="bg-sky-50 text-sky-600"
          />
          <StatTile
            icon={IndianRupee}
            label="Revenue"
            value={`₹${o.revenue.total}`}
            tone="bg-emerald-50 text-emerald-600"
            hint={`${o.revenue.payments} payments`}
          />
        </div>
      )}

      {o && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bookings by status */}
          <Card title="Bookings by status" icon={CalendarDays}>
            {statusEntries.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                  {statusEntries.map(([s, c]) => (
                    <div
                      key={s}
                      className={STATUS_COLORS[s]?.bar || 'bg-slate-300'}
                      style={{ width: `${(c / statusTotal) * 100}%` }}
                      title={`${s}: ${c}`}
                    />
                  ))}
                </div>
                <ul className="mt-4 space-y-2.5">
                  {statusEntries.map(([s, c]) => (
                    <li key={s} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 capitalize text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[s]?.dot || 'bg-slate-300'}`} />
                        {s}
                      </span>
                      <span className="font-bold text-[#172033]">{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          {/* Bookings per day */}
          <Card title="Bookings per day" icon={CalendarDays}>
            {perDay.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings in the last 14 days.</p>
            ) : (
              <div className="flex h-44 items-end gap-2 overflow-x-auto pb-1">
                {perDay.map((d) => (
                  <div key={d.date} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-xs font-bold text-[#172033]">{d.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500"
                      style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: '4px' }}
                      title={`${d.date}: ${d.count}`}
                    />
                    <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top providers */}
          <Card title="Top providers" icon={Trophy}>
            {analytics.topProviders.length === 0 ? (
              <p className="text-sm text-slate-500">No completed bookings yet.</p>
            ) : (
              <ol className="space-y-3">
                {analytics.topProviders.map((p, i) => (
                  <li key={p._id} className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#172033]">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        {p.city}
                        {p.ratingCount > 0 && (
                          <>
                            <span>·</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.ratingAverage}
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">{p.completedBookings} jobs</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}

      {/* Provider verification */}
      <Card title="Provider verification" icon={ShieldCheck}>
        {provLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="text-sm text-slate-500">No provider profiles yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {providers.map((p) => (
              <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                    {p.user?.name?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-[#172033]">
                      {p.user?.name}
                      {p.isVerified && <BadgeCheck className="h-4 w-4 fill-indigo-600 text-white" />}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {p.category?.name} · {p.city}
                    </p>
                  </div>
                </div>
                <button
                  disabled={busyId === p._id}
                  onClick={() => setVerified(p._id, !p.isVerified)}
                  className={p.isVerified ? 'btn-secondary gap-1.5' : 'btn-primary gap-1.5'}
                >
                  {busyId === p._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : p.isVerified ? (
                    <ShieldOff className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {p.isVerified ? 'Unverify' : 'Verify'}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <Pagination page={provPage} pages={provPages} onChange={setProvPage} />
        </div>

        <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-slate-600">Verify by provider profile ID</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              placeholder="Provider profile id"
              className="input flex-1"
            />
            <button disabled={!providerId.trim()} onClick={() => setVerified(providerId.trim(), true)} className="btn-primary">
              Verify
            </button>
            <button disabled={!providerId.trim()} onClick={() => setVerified(providerId.trim(), false)} className="btn-secondary">
              Unverify
            </button>
          </div>
        </details>
      </Card>

      {/* Users */}
      <Card title="Users" icon={Users}>
        <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {ROLE_TABS.map((t) => {
            const count = t.value ? o?.users.byRole[t.value] : o?.users.total;
            return (
              <button
                key={t.value}
                onClick={() => {
                  setPage(1);
                  setRole(t.value);
                }}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  role === t.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {t.label}
                {count !== undefined && <span className="ml-1.5 opacity-75">{count}</span>}
              </button>
            );
          })}
        </div>

        {usersLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={SearchX} title="No users found" text="There are no users with this role yet." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((u) => {
              const inactive = u.isActive === false;
              const isMe = u._id === me?.id;
              return (
                <li key={u._id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {u.name?.[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[#172033]">
                        {u.name}
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${ROLE_BADGE[u.role]}`}>
                          {u.role}
                        </span>
                        {inactive && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">
                            Deactivated
                          </span>
                        )}
                        {isMe && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                            You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {u.email} · Joined {formatJoined(u.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => toggleActive(u)}
                      className={inactive ? 'btn-primary gap-1.5' : 'btn-secondary gap-1.5 hover:!border-red-300 hover:!bg-red-50 hover:!text-red-700'}
                    >
                      {inactive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      {inactive ? 'Activate' : 'Deactivate'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!usersLoading && users.length > 0 && (
          <div className="mt-4">
            <Pagination page={page} pages={pages} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminDashboard;