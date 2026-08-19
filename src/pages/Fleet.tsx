import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { liveFleet, statusLabel } from "../lib/fleetStatus";

const InspectBay = lazy(() => import("../components/InspectBay"));

export default function Fleet() {
  const [vehicles, setVehicles] = useState(() => liveFleet());
  const [active, setActive] = useState(vehicles[0]?.id ?? "CC-01");

  useEffect(() => {
    const id = window.setInterval(() => setVehicles(liveFleet()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const selected = vehicles.find((v) => v.id === active) ?? vehicles[0];
  const open = vehicles.filter((v) => v.status === "available").length;

  return (
    <section className="section hangar">
      <div className="shell">
        <p className="kicker">Lake Nona hangar</p>
        <div className="section-head">
          <div>
            <h2>Bays</h2>
            <p className="muted">12 units · {open} open · orbit, sit inside, or open the trunk</p>
          </div>
          <Link className="btn primary" to={`/book?vehicle=${selected.type}`}>
            Dispatch {selected.id}
          </Link>
        </div>

        <div className="hangar-stage">
          <Suspense fallback={<div className="viewer-fallback tall" />}>
            <InspectBay type={selected.type} paint={selected.paint} key={selected.id} />
          </Suspense>
          <div className="hangar-meta">
            <strong className="unit">{selected.id}</strong>
            <p className="muted">
              {selected.type === "cybercab" ? "Cybercab" : "Model Y"} · {selected.seats} seats · {selected.zone}
              {selected.etaMin ? ` · ${selected.etaMin} min` : ""}
            </p>
            <p className="tiny muted">{selected.notes}</p>
            <Link className="btn ghost" to={`/inspect/${selected.type}?paint=${selected.paint}&unit=${selected.id}`}>
              Open inspector
            </Link>
          </div>
        </div>

        <div className="bay-list">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              className={`bay-row ${vehicle.id === selected.id ? "on" : ""} ${vehicle.status}`}
              onClick={() => setActive(vehicle.id)}
            >
              <span className="unit">{vehicle.id}</span>
              <span className="tiny muted">
                {vehicle.type === "cybercab" ? "Cybercab" : "Model Y"} · {vehicle.paint === "gold" ? "Champagne" : vehicle.paint === "grey" ? "Stealth" : "Pearl"}
              </span>
              <span className={`pill ${vehicle.status}`}>{statusLabel[vehicle.status]}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
