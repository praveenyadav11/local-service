import { useState } from "react";
import api from "../api/axios";

function ReviewForm({ bookingId, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        bookingId,
        rating: Number(rating),
        comment,
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full border-t pt-3 mt-2 space-y-2"
    >
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)} ({n})
          </option>
        ))}
      </select>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)"
        maxLength={500}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          disabled={submitting}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
        >
          Submit review
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-slate-600"
        >
          Close
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
