import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function PayButton({ bookingId, onDone }) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/payments/order", { bookingId });

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ServiceConnect",
        description: "Service booking payment",
        order_id: data.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", response);
            onDone();
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setBusy(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment");
      setBusy(false);
    }
  };
    const handleCash = async () => {
      setError("");
      setBusy(true);
      try {
        await api.post("/payments/cash", { bookingId });
        onDone("cash");
      } catch (err) {
        setError(err.response?.data?.message || "Could not choose cash");
      } finally {
        setBusy(false);
      }
    };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={handlePay} disabled={busy} className="btn-primary">
        {busy ? "Processing..." : "Pay now"}
      </button>
      <button onClick={handleCash} disabled={busy} className="btn-secondary">
        Pay cash after service
      </button>
      {error && <span className="text-sm text-rose-600">{error}</span>}
    </div>
  );
}

export default PayButton;
