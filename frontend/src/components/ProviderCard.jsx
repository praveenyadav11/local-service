import { Link } from "react-router-dom";

function ProviderCard({ provider }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{provider.user?.name}</h2>
        {provider.isVerified && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            Verified
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600">{provider.category?.name}</p>
      <p className="text-sm">{provider.city}</p>
      <p className="text-sm font-medium">₹{provider.hourlyRate}/hour</p>
      {provider.ratingCount > 0 && (
        <p className="text-sm text-yellow-600">
          ★ {provider.ratingAverage} ({provider.ratingCount})
        </p>
      )}
      {provider.distanceKm !== undefined && (
        <p className="text-xs text-slate-500">{provider.distanceKm} km away</p>
      )}
      <Link
        to={`/providers/${provider._id}`}
        className="mt-2 text-center bg-blue-600 text-white py-1.5 rounded"
      >
        View
      </Link>
    </div>
  );
}

export default ProviderCard;
