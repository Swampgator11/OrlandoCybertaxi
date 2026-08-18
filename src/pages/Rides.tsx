import { useMemo } from "react";
import { Link } from "react-router-dom";
import { listRides } from "../lib/bookings";
import { formatUsd } from "../lib/quotes";

export default function Rides() {
  const rides = useMemo(() => listRides(), []);

  return (
    <section className="section">
      <div className="shell">
        <p className="kicker">Trip log</p>
        <div className="section-head">
          <h2>My rides</h2>
          <Link className="btn primary" to="/book">
            New ride
          </Link>
        </div>
        {rides.length === 0 ? (
          <div className="panel">
            <p>No trips on this device yet.</p>
            <Link to="/book">Book the first one</Link>
          </div>
        ) : (
          <div className="rides-list">
            {rides.map((ride) => (
              <Link className="panel ride-row" key={ride.id} to={`/rides/${ride.id}`}>
                <strong>{ride.id}</strong>
                <div>
                  {ride.pickup} → {ride.dropoff}
                  <div className="tiny muted">
                    {new Date(ride.when).toLocaleString()} · {ride.assignedVehicle}
                  </div>
                </div>
                <div>
                  {formatUsd(ride.quote.total)}
                  <div className="tiny muted">{ride.status}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
