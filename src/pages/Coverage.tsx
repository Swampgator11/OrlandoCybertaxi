import { Link } from "react-router-dom";
import { hubs } from "../data/locations";

function toPct(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

export default function Coverage() {
  const lats = hubs.map((h) => h.lat);
  const lngs = hubs.map((h) => h.lng);
  const minLat = Math.min(...lats) - 0.04;
  const maxLat = Math.max(...lats) + 0.04;
  const minLng = Math.min(...lngs) - 0.04;
  const maxLng = Math.max(...lngs) + 0.04;

  return (
    <section className="section">
      <div className="shell">
        <p className="kicker">Service area</p>
        <div className="section-head">
          <h2>Greater Orlando, pinned.</h2>
          <Link className="btn ghost" to="/book">
            Book from a pin
          </Link>
        </div>
        <div className="panel coverage-map">
          <svg width="100%" height="420" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect width="100" height="100" fill="#101218" />
            <path d="M8 72 C 30 60, 55 78, 92 58" stroke="rgba(255,90,31,.35)" fill="none" strokeWidth="1.2" />
            <path d="M20 18 C 40 40, 48 55, 70 92" stroke="rgba(126,224,200,.25)" fill="none" strokeWidth="1" />
          </svg>
          {hubs.map((hub) => {
            const left = toPct(hub.lng, minLng, maxLng);
            const top = 100 - toPct(hub.lat, minLat, maxLat);
            return (
              <Link
                key={hub.id}
                className={`pin ${hub.kind}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                to={`/book?from=${hub.id}`}
                title={hub.name}
              >
                <span>{hub.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="grid-3" style={{ marginTop: 16 }}>
          {hubs.map((hub) => (
            <article className="panel" key={hub.id}>
              <strong>{hub.name}</strong>
              <p className="tiny muted">{hub.area}</p>
              <Link className="tiny" to={`/book?from=${hub.id}`}>
                Start here →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
