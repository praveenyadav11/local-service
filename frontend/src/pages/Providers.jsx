import { useEffect, useState } from "react";
import api from "../api/axios";
import ProviderCard from "../components/ProviderCard";

function Providers() {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { page, limit: 9 };
    if (category) params.category = category;

    let request;
    if (coords) {
      params.lat = coords.lat;
      params.lng = coords.lng;
      request = api.get("/providers/nearby", { params });
    } else {
      if (city.trim()) params.city = city.trim();
      request = api.get("/providers", { params });
    }

    request
      .then((res) => {
        setProviders(res.data.providers);
        setPages(res.data.pages || 1);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load providers"),
      )
      .finally(() => setLoading(false));
  }, [category, city, page, coords]);

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPage(1);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setError("Could not get your location"),
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Providers</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => {
            setPage(1);
            setCategory(e.target.value);
          }}
          className="border rounded px-3 py-2 bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={city}
          onChange={(e) => {
            setPage(1);
            setCoords(null);
            setCity(e.target.value);
          }}
          placeholder="City"
          disabled={!!coords}
          className="border rounded px-3 py-2 bg-white disabled:opacity-50"
        />

        {coords ? (
          <button
            onClick={() => setCoords(null)}
            className="bg-slate-600 text-white px-3 py-2 rounded"
          >
            Clear location
          </button>
        ) : (
          <button
            onClick={useMyLocation}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Near me
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : providers.length === 0 ? (
        <p className="text-slate-500">No providers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p._id} provider={p} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Providers;
