import { Link, Navigate, useParams } from "react-router-dom";
import { getRide, updateRideStatus } from "../lib/bookings";
import { formatUsd } from "../lib/quotes";
import { useState } from "react";

export default function Confirmation() {
  const { id } = useParams();
  const stored = id ? getRide(id) : undefined;
  const [ride, setRide] = useState(stored);

  if (!id) return <Navigate to="/rides" replace />;
  if (!ride) {
    return (
      <section className="section">
        <div className="shell panel">
          <h2>Ride not on this device</h2>
          <p className="muted">Confirmations are saved in your browser.</p>
          <Link to="/rides">Back to my rides</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="shell grid-2">
        <div className="receipt">
          <p className="tiny">ORLANDO CYBERTAXI · TRIP RECEIPT · LAKE NONA</p>
          <h2>{ride.id}</h2>
          <p>
            {ride.pickup}
            <br />→ {ride.dropoff}
          </p>
          <p>
            {new Date(ride.when).toLocaleString()}
            <br />
            {ride.vehicle === "cybercab" ? "Cybercab" : "Model Y"} · {ride.assignedVehicle}
            <br />
            {ride.passengers} passenger{ride.passengers === 1 ? "" : "s"} · {ride.name}
          </p>
          <p>
            {ride.quote.miles} mi · {ride.quote.minutes} min
            <br />
            {formatUsd(ride.quote.total)}
          </p>
          <p className="tiny">Status: {ride.status.toUpperCase()}</p>
        </div>
        <div className="panel">
          <p className="kicker">Dispatch board</p>
          <h3>Your car is on the board</h3>
          <p className="muted">
            {ride.assignedVehicle} is assigned for this reservation — hours ahead, not a
            street hail. Meet curbside with this trip ID. Cancel anytime before pickup.
          </p>
          <div className="row">
            {ride.status !== "canceled" && ride.status !== "complete" && (
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  const next = updateRideStatus(ride.id, "canceled");
                  if (next) setRide(next);
                }}
              >
                Cancel ride
              </button>
            )}
            {ride.status === "confirmed" && (
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  const next = updateRideStatus(ride.id, "dispatched");
                  if (next) setRide(next);
                }}
              >
                Mark dispatched
              </button>
            )}
            {ride.status === "dispatched" && (
              <button
                className="btn primary"
                type="button"
                onClick={() => {
                  const next = updateRideStatus(ride.id, "complete");
                  if (next) setRide(next);
                }}
              >
                Complete trip
              </button>
            )}
            <Link className="btn ghost" to="/book">
              Book another
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
