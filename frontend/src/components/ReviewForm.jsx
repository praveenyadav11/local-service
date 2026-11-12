import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import api from "../api/axios";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function ReviewForm({ bookingId, onDone }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reviews", { bookingId, rating, comment });
      onDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              className="p-0.5"
            >
              <Star
                className={`h-7 w-7 transition ${
                  n <= shown
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-semibold text-slate-600">
          {LABELS[shown]}
        </span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        maxLength={500}
        rows={3}
        className="input"
      />
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={submitting} className="btn-primary gap-2">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Submit
          review
        </button>
        <button
          type="button"
          onClick={() => onDone(false)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
