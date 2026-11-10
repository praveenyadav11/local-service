import { useEffect, useState } from "react";
import api from "../api/axios";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ProviderAvailability() {
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/availability/me")
      .then((res) => {
        const a = res.data.availability;
        setWorkingDays(a.workingDays);
        setStartHour(a.startHour);
        setEndHour(a.endHour);
      })
      .catch((err) => {
        if (
          err.response?.status === 404 &&
          err.response.data.message.includes("profile")
        ) {
          setError(err.response.data.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (d) =>
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.put("/availability", {
        workingDays,
        startHour: Number(startHour),
        endHour: Number(endHour),
      });
      setSuccess("Availability saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save availability");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-5 space-y-4 max-w-lg"
    >
      <h1 className="text-2xl font-bold">My availability</h1>

      <div className="flex flex-wrap gap-2">
        {DAYS.map((label, d) => (
          <button
            type="button"
            key={d}
            onClick={() => toggleDay(d)}
            className={`px-3 py-1 rounded border ${
              workingDays.includes(d) ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 items-center">
        <label className="text-sm">
          Start hour
          <input
            type="number"
            min="0"
            max="23"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            className="block border rounded px-3 py-2 w-24"
          />
        </label>
        <label className="text-sm">
          End hour
          <input
            type="number"
            min="1"
            max="24"
            value={endHour}
            onChange={(e) => setEndHour(e.target.value)}
            className="block border rounded px-3 py-2 w-24"
          />
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save availability
      </button>
    </form>
  );
}

export default ProviderAvailability;
