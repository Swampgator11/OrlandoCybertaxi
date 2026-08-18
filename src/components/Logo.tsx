import { Link } from "react-router-dom";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Orlando Cybertaxi home">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill="#16181f" stroke="rgba(232,235,232,.16)" />
        <path d="M7 22.5h20l-2.4-7.1A4.2 4.2 0 0 0 20.6 12h-7.2a4.2 4.2 0 0 0-4 3.4L7 22.5z" fill="#e8ebe8" />
        <rect x="9.4" y="14.2" width="6.4" height="3.3" rx=".7" fill="#101218" />
        <rect x="18.2" y="14.2" width="6.4" height="3.3" rx=".7" fill="#101218" />
        <circle cx="11.2" cy="23.4" r="1.6" fill="#d8dde3" />
        <circle cx="22.8" cy="23.4" r="1.6" fill="#d8dde3" />
      </svg>
      <span>
        {!compact && <small>ORLANDO</small>}
        CYBERTAXI
      </span>
    </Link>
  );
}
