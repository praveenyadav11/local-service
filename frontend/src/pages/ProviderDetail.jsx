import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const todayString = () => new Date().toLocaleDateString("en-CA");

function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [date, setDate] = useState(todayString());
  const [slots, setSlots] = useState([]);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/providers/${id}`)
      .then((res) => setProvider(res.data.provider))
      .catch(() => navigate("/providers"));
    api
      .get(`/reviews/provider/${id}`)
      .then((res) => setReviews(res.data.reviews));
  }, [id, navigate]);

  const loadSlots = () => {
    setSlotsMessage("");
    api
      .get(`/providers/${id}/slots`, { params: { date } })
      .then((res) => {
        setSlots(res.data.slots);
        if (res.data.slots.length === 0)
          setSlotsMessage("No slots available on this date.");
      })
      .catch((err) => {
        setSlots([]);
        setSlotsMessage(err.response?.data?.message || "Could not load slots");
      });
  };

  useEffect(() => {
    setSelected("");
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        providerId: id,
        date,
        startTime: selected,
        address,
        notes,
      });
      setSuccess("Booking requested! The provider will confirm soon.");
      setSelected("");
      setAddress("");
      setNotes("");
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      loadSlots();
    } finally {
      setSubmitting(false);
    }
  };

  if (!provider) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-5 space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{provider.user?.name}</h1>
          {provider.isVerified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Verified
            </span>
          )}
        </div>
        <p className="text-slate-600">
          {provider.category?.name} · {provider.city}
        </p>
        <p className="font-medium">
          ₹{provider.hourlyRate}/hour · {provider.experienceYears} yrs
          experience
        </p>
        {provider.ratingCount > 0 && (
          <p className="text-yellow-600">
            ★ {provider.ratingAverage} ({provider.ratingCount} reviews)
          </p>
        )}
        {provider.bio && <p className="pt-2">{provider.bio}</p>}
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-4">
        <h2 className="text-lg font-semibold">Book a slot</h2>

        <input
          type="date"
          value={date}
          min={todayString()}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        {slotsMessage && (
          <p className="text-sm text-slate-500">{slotsMessage}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              type="button"
              key={s.startTime}
              onClick={() => setSelected(s.startTime)}
              className={`px-3 py-1 rounded border ${
                selected === s.startTime ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {s.startTime} - {s.endTime}
            </button>
          ))}
        </div>

        {!user ? (
          <p className="text-sm">
            <Link to="/login" className="text-blue-600">
              Login
            </Link>{" "}
            as a customer to book.
          </p>
        ) : user.role !== "customer" ? (
          <p className="text-sm text-slate-500">Only customers can book.</p>
        ) : (
          selected && (
            <form onSubmit={handleBook} className="space-y-3">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Service address"
                required
                maxLength={200}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                maxLength={300}
                className="w-full border rounded px-3 py-2"
              />
              <button
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {submitting ? "Booking..." : `Book ${selected} on ${date}`}
              </button>
            </form>
          )
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </div>

      <div className="bg-white rounded-lg shadow p-5 space-y-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        {reviews.length === 0 && (
          <p className="text-sm text-slate-500">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <div key={r._id} className="border-t pt-2">
            <p className="text-sm font-medium">
              {r.customer?.name} ·{" "}
              <span className="text-yellow-600">{"★".repeat(r.rating)}</span>
            </p>
            {r.comment && <p className="text-sm">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProviderDetail;
