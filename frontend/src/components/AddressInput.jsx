import { useState } from "react";

function AddressInput({ value, onChange, coords, onCoords }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();
          onChange(
            (data.display_name || `${latitude}, ${longitude}`).slice(0, 200),
          );
        } catch {
          onChange(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError(
          "Could not get your location. Allow location access and try again.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const searchAddress = async () => {
    setError("");
    if (!value.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(value)}`,
      );
      const data = await res.json();
      if (data.length) {
        onCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
      } else {
        setError("Address not found on the map");
      }
    } catch {
      setError("Could not search the map right now");
    }
  };

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.003}%2C${coords.lng + 0.005}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Service address"
        required
        maxLength={200}
        rows={2}
        className="input"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="btn-secondary"
        >
          {locating ? "Locating..." : "📍 Use current location"}
        </button>
        <button type="button" onClick={searchAddress} className="btn-secondary">
          🗺 Show on map
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {mapSrc && (
        <div className="space-y-1">
          <iframe
            title="Service location"
            src={mapSrc}
            className="h-44 w-full rounded-xl border border-slate-200"
            loading="lazy"
          />
          <a
            href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-600"
          >
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

export default AddressInput;
