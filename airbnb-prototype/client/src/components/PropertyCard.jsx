import React from 'react';
import { Link } from 'react-router-dom';
const SERVER = 'http://localhost:4000';

const Bed = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
    <path fill="currentColor" d="M3 7h10a4 4 0 014 4v6h-2v-2H5v2H3V7zm2 2v4h12v-2a2 2 0 00-2-2H5zM7 9h4v2H7z"/>
  </svg>
);
const Bath = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
    <path fill="currentColor" d="M7 3a3 3 0 00-3 3v7h16v2a4 4 0 11-8 0h-2a4 4 0 11-8 0V6a5 5 0 015-5h2v2H7z"/>
  </svg>
);
const Users = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden {...props}>
    <path fill="currentColor" d="M12 12a4 4 0 10-4-4 4 4 0 004 4zm-7 8a7 7 0 0114 0v1H5z"/>
  </svg>
);
const Heart = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.54 0 3.09.81 4 2.09C11.41 4.81 12.96 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z"
      fill={filled ? '#ef4444' : '#ffffff'}
      stroke="#1f2937"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PropertyCard({ p, fav, onFav }) {
  const photos = Array.isArray(p.photos) ? p.photos : [];
  const cover = photos[0] ? `${SERVER}${photos[0]}` : null;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow transition
                    hover:shadow-xl hover:-translate-y-0.5 duration-200">
      <div className="relative h-56 w-full bg-gray-100">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400">No photo</div>
        )}
        <button
          title={fav ? 'Unfavorite' : 'Favorite'}
          onClick={onFav}
          className="absolute top-3 right-3 rounded-full p-1 bg-white/90 hover:scale-105 transition"
        >
          <Heart filled={fav} />
        </button>
      </div>

      <div className="p-4 space-y-1">
        <div className="font-semibold">{p.name}</div>
        <div className="text-sm text-gray-500">
          {[p.city, p.state, p.country].filter(Boolean).join(', ')}
        </div>

        <div className="text-sm flex items-center gap-3 mt-1">
          <span className="font-semibold">${p.pricePerNight}</span> <span className="text-gray-500">night</span>
          <span className="inline-flex items-center gap-1 text-gray-700"><Bed/> {p.bedrooms}</span>
          <span className="inline-flex items-center gap-1 text-gray-700"><Bath/> {p.bathrooms}</span>
          <span className="inline-flex items-center gap-1 text-gray-700"><Users/> {p.maxGuests}</span>
        </div>

        <div className="pt-2">
          <Link
            to={`/properties/${p.id}`}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
