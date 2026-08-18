import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CybercabArt, ModelYArt } from "../components/VehicleArt";
import { liveFleet, statusLabel } from "../lib/fleetStatus";

export default function Fleet() {
  const [vehicles, setVehicles] = useState(() => liveFleet());

  useEffect(() => {
    const id = window.setInterval(() => setVehicles(liveFleet()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const open = vehicles.filter((v) => v.status === "available").length;

  return (
    <section className="section">
      <div className="shell">
        <p className="kicker">Hangar</p>
        <div className="section-head">
          <div>
            <h2>12 vehicles on the board</h2>
            <p className="muted">10 Cybercabs · 2 Model Y · {open} open right now</p>
          </div>
          <Link className="btn primary" to="/book">
            Dispatch one
          </Link>
        </div>
        <div className="fleet-grid">
          {vehicles.map((vehicle) => (
            <article className="panel vehicle-card" key={vehicle.id}>
              <header>
                <div>
                  <strong>{vehicle.id}</strong>
                  <div className="tiny muted">{vehicle.seats} seats</div>
                </div>
                <span className={`pill ${vehicle.status}`}>{statusLabel[vehicle.status]}</span>
              </header>
              {vehicle.type === "cybercab" ? <CybercabArt /> : <ModelYArt />}
              <div className="tiny muted">
                {vehicle.zone}
                {vehicle.etaMin ? ` · ${vehicle.etaMin} min` : ""}
                <div>{vehicle.notes}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
