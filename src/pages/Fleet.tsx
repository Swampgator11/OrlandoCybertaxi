import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VehiclePortrait } from "../components/VehicleArt";
import { liveFleet, statusLabel } from "../lib/fleetStatus";

export default function Fleet() {
  const [vehicles, setVehicles] = useState(() => liveFleet());

  useEffect(() => {
    const id = window.setInterval(() => setVehicles(liveFleet()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const cabs = vehicles.filter((v) => v.type === "cybercab");
  const ys = vehicles.filter((v) => v.type === "model-y");
  const open = vehicles.filter((v) => v.status === "available").length;

  return (
    <section className="section hangar">
      <div className="shell">
        <p className="kicker">Lake Nona hangar</p>
        <div className="section-head">
          <div>
            <h2>The actual fleet</h2>
            <p className="muted">
              10 Cybercabs · 2 Model Y Juniper · {open} open on this board
            </p>
          </div>
          <Link className="btn primary shine" to="/book">
            Dispatch one
          </Link>
        </div>

        <p className="kicker">Robotaxi row</p>
        <div className="fleet-grid">
          {cabs.map((vehicle) => (
            <article className={`panel vehicle-card bay ${vehicle.status}`} key={vehicle.id}>
              <header>
                <div>
                  <strong className="unit">{vehicle.id}</strong>
                  <div className="tiny muted">
                    {vehicle.paint === "white" ? "Pearl Cybercab" : "Champagne Cybercab"} · 2 seats
                  </div>
                </div>
                <span className={`pill ${vehicle.status}`}>{statusLabel[vehicle.status]}</span>
              </header>
              <VehiclePortrait type="cybercab" paint={vehicle.paint} alt={vehicle.name} />
              <div className="tiny muted">
                {vehicle.zone}
                {vehicle.etaMin ? ` · ${vehicle.etaMin} min` : ""}
                <div>{vehicle.notes}</div>
              </div>
            </article>
          ))}
        </div>

        <p className="kicker" style={{ marginTop: 36 }}>
          Crew row
        </p>
        <div className="fleet-grid crew">
          {ys.map((vehicle) => (
            <article className={`panel vehicle-card bay wide ${vehicle.status}`} key={vehicle.id}>
              <header>
                <div>
                  <strong className="unit">{vehicle.id}</strong>
                  <div className="tiny muted">
                    {vehicle.paint === "grey" ? "Stealth Grey" : "Pearl White"} Model Y · 5 seats
                  </div>
                </div>
                <span className={`pill ${vehicle.status}`}>{statusLabel[vehicle.status]}</span>
              </header>
              <VehiclePortrait type="model-y" paint={vehicle.paint} alt={vehicle.name} />
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
