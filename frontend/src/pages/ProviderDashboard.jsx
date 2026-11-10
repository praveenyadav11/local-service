import useBookings from "../hooks/useBookings";
import BookingList from "../components/BookingList";

function ProviderDashboard() {
  const data = useBookings("/bookings/provider");
  return <BookingList title="Booking Requests" role="provider" data={data} />;
}

export default ProviderDashboard;
