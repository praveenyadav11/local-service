import { useEffect, useState } from "react";
import api from "../api/axios";

function ProviderProfile() {
  const [categories, setCategories] = useState([]);
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState({
    category: "",
    bio: "",
    experienceYears: 0,
    hourlyRate: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
    api
      .get("/providers/profile/me")
      .then((res) => {
        const p = res.data.profile;
        setExists(true);
        setForm({
          category: p.category?._id || "",
          bio: p.bio || "",
          experienceYears: p.experienceYears,
          hourlyRate: p.hourlyRate,
          city: p.city,
          latitude: p.location?.coordinates?.[1] ?? "",
          longitude: p.location?.coordinates?.[0] ?? "",
        });
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })),
      () => setError("Could not get your location"),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const body = {
      category: form.category,
      bio: form.bio,
      experienceYears: Number(form.experienceYears),
      hourlyRate: Number(form.hourlyRate),
      city: form.city,
    };
    if (form.latitude !== "" && form.longitude !== "") {
      body.latitude = Number(form.latitude);
      body.longitude = Number(form.longitude);
    }

    try {
      if (exists) {
        await api.put("/providers/profile", body);
      } else {
        await api.post("/providers/profile", body);
        setExists(true);
      }
      setSuccess("Profile saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-5 space-y-3 max-w-lg"
    >
      <h1 className="text-2xl font-bold">
        {exists ? "Edit profile" : "Create your profile"}
      </h1>

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        name="bio"
        value={form.bio}
        onChange={handleChange}
        placeholder="Bio"
        maxLength={500}
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="experienceYears"
        type="number"
        min="0"
        max="60"
        value={form.experienceYears}
        onChange={handleChange}
        placeholder="Years of experience"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="hourlyRate"
        type="number"
        min="0"
        value={form.hourlyRate}
        onChange={handleChange}
        placeholder="Hourly rate (₹)"
        required
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="City"
        required
        className="w-full border rounded px-3 py-2"
      />

      <div className="flex gap-2">
        <input
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          placeholder="Latitude"
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          placeholder="Longitude"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="button"
        onClick={useMyLocation}
        className="text-sm text-blue-600"
      >
        Use my current location
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Save profile
      </button>
    </form>
  );
}

export default ProviderProfile;
