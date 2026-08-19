import { Link } from "react-router-dom";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Orlando Cybertaxi home">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <defs>
          <linearGradient id="crest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8d08a" />
            <stop offset="0.45" stopColor="#c4a35a" />
            <stop offset="1" stopColor="#6e4e22" />
          </linearGradient>
        </defs>
        <rect x="1.2" y="1.2" width="33.6" height="33.6" rx="3" fill="#1a120c" stroke="url(#crest)" strokeWidth="1.8" />
        <rect x="5" y="5" width="26" height="26" fill="none" stroke="#8a6233" strokeWidth="0.6" />
        <path d="M8 23.2h20l-2.2-6.4A3.8 3.8 0 0 0 22.2 14h-8.4a3.8 3.8 0 0 0-3.6 2.8L8 23.2z" fill="#efe4c8" />
        <rect x="10.4" y="15.8" width="5.8" height="3" rx="0.4" fill="#3a1814" />
        <rect x="19.8" y="15.8" width="5.8" height="3" rx="0.4" fill="#3a1814" />
        <circle cx="12.2" cy="24" r="1.5" fill="#c4a35a" />
        <circle cx="23.8" cy="24" r="1.5" fill="#c4a35a" />
      </svg>
      <span>
        {!compact && <small>Lake Nona hangar</small>}
        Cybertaxi
      </span>
    </Link>
  );
}
