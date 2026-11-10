import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
export default function useBookings(endpoint) {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (status) params.status = status;
    api
      .get(endpoint, { params })
      .then((res) => {
        setBookings(res.data.bookings);
        setPages(res.data.pages || 1);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [endpoint, page, status]);

  useEffect(() => {
    load();
  }, [load]);

    const { lastEvent } = useSocket();
  useEffect(() => {
    if (lastEvent) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvent]);

  const changeStatus = async (id, newStatus) => {
    setBusy(true);
    setError('');
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update booking');
    } finally {
      setBusy(false);
    }
  };

  return { bookings, status, setStatus, page, setPage, pages, loading, error, busy, changeStatus, load };
}