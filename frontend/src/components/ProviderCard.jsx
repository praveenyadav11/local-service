import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Briefcase,
  Clock,
  MapPin,
  Navigation,
  Star,
} from "lucide-react";
import api from "../api/axios";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-violet-500 to-fuchsia-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

const gradientFor = (name = "") =>
  GRADIENTS[
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % GRADIENTS.length
  ];

const today = () => new Date().toLocaleDateString("en-CA");

function Availability({ providerId }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/providers/${providerId}/slots`, { params: { date: today() } })
      .then((res) => {
        if (!cancelled) setState({ loading: false, slots: res.data.slots });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, unknown: true });
      });
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  if (state.loading)
    return <span className="h-4 w-32 animate-pulse rounded bg-slate-200" />;
  if (state.unknown) return null;

  const next = state.slots[0];
  if (!next) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        No slots left today
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Available today from {next.startTime}
    </span>
  );
}

function ProviderCard({ provider }) {
  const name = provider.user?.name || "Provider";
  const hasRating = provider.ratingCount > 0;
  const profilePath = `/providers/${provider._id}`;

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${gradientFor(
            name,
          )} text-2xl font-extrabold text-white shadow-md`}
        >
          {name[0]?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-base font-bold text-[#172033]">
              {name}
            </h2>
            {provider.isVerified && (
              <BadgeCheck
                className="h-5 w-5 shrink-0 fill-indigo-600 text-white"
                aria-label="Verified"
              />
            )}
          </div>
          <p className="text-sm font-medium text-indigo-600">
            {provider.category?.name}
          </p>

          <div className="mt-1.5 flex items-center gap-1 text-sm">
            {hasRating ? (
              <>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-[#172033]">
                  {provider.ratingAverage}
                </span>
                <span className="text-slate-500">
                  ({provider.ratingCount} reviews)
                </span>
              </>
            ) : (
              <span className="text-slate-400">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          <MapPin className="h-3.5 w-3.5" /> {provider.city}
        </span>
        {provider.experienceYears !== undefined && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Briefcase className="h-3.5 w-3.5" /> {provider.experienceYears} yrs
            exp.
          </span>
        )}
        {provider.distanceKm !== undefined && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Navigation className="h-3.5 w-3.5" /> {provider.distanceKm} km away
          </span>
        )}
      </div>

      {provider.bio && (
        <p className="mt-4 line-clamp-2 text-sm text-slate-600">
          {provider.bio}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Starting at</p>
          <p className="text-xl font-extrabold text-[#172033]">
            ₹{provider.hourlyRate}
            <span className="text-sm font-medium text-slate-500">/hr</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-slate-400" />
          <Availability providerId={provider._id} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={profilePath}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
        >
          View profile
        </Link>
        <Link
          to={profilePath}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Book now
        </Link>
      </div>
    </article>
  );
}

export default ProviderCard;
