import { useEffect, useState } from "react";
import useBookings from "../hooks/useBookings";
import BookingList from "../components/BookingList";
import ReviewForm from "../components/ReviewForm";
import PayButton from "../components/PayButton";
import api from "../api/axios";

function MyBookings() {
  const data = useBookings("/bookings/my");
  const [paidIds, setPaidIds] = useState([]);
  const [reviewing, setReviewing] = useState(null);

  const loadPayments = () => {
    api
      .get("/payments/my", { params: { limit: 50 } })
      .then((res) => setPaidIds(res.data.payments.map((p) => p.booking?._id)))
      .catch(() => {});
  };

  useEffect(loadPayments, []);

  const renderExtra = (b) => (
    <>
      {b.status === "confirmed" && !paidIds.includes(b._id) && (
        <PayButton bookingId={b._id} onDone={loadPayments} />
      )}
      {b.status === "confirmed" && paidIds.includes(b._id) && (
        <span className="text-sm text-green-700">Paid</span>
      )}
      {b.status === "completed" && reviewing !== b._id && (
        <button
          onClick={() => setReviewing(b._id)}
          className="text-sm text-blue-600"
        >
          Leave a review
        </button>
      )}
      {b.status === "completed" && reviewing === b._id && (
        <ReviewForm bookingId={b._id} onDone={() => setReviewing(null)} />
      )}
    </>
  );

  return (
    <BookingList
      title="My Bookings"
      role="customer"
      data={data}
      renderExtra={renderExtra}
    />
  );
}

export default MyBookings;
