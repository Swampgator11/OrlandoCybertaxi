import { Link } from "react-router-dom";
import { liveFleet, statusLabel } from "../lib/fleetStatus";

export default function Ticker() {
  const vehicles = liveFleet();
  const line = vehicles
    .map((v) => `${v.id} ${statusLabel[v.status].toUpperCase()} · ${v.zone}`)
    .join("     ✦     ");

  return (
    <div className="ticker" aria-hidden="true">
      <Link to="/fleet" className="ticker-track">
        <span>{line}</span>
        <span>{line}</span>
      </Link>
    </div>
  );
}
