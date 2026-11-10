import { useState } from "react";
import api from "../api/axios";

function PayButton({ bookingId, onDone }) {
  const [method, setMethod] = useState("upi");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    setError("");
    setBusy(true);
    try {
      await api.post("/payments", { bookingId, method });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="upi">UPI</option>
        <option value="card">Card</option>
        <option value="netbanking">Net banking</option>
        <option value="cash">Cash</option>
      </select>
      <button
        onClick={handlePay}
        disabled={busy}
        className="bg-green-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
      >
        {busy ? "Paying..." : "Pay"}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}

export default PayButton;
