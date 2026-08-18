import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { vehicleCopy, type VehicleType } from "../data/fleet";
import { hubs, kindLabel, type Hub } from "../data/locations";
import { createRide, makeRideId } from "../lib/bookings";
import { assignVehicle } from "../lib/fleetStatus";
import { haversineMiles } from "../lib/geo";
import { formatUsd, quoteTrip } from "../lib/quotes";
import { CybercabArt, ModelYArt } from "../components/VehicleArt";

const CUSTOM_ID = "custom";

type LocState = {
  hubId: string;
  custom: string;
};

function hashOffset(text: string): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  const lat = 28.42 + (h % 180) / 1000;
  const lng = -81.48 + ((h >> 8) % 220) / 1000;
  return { lat, lng };
}

function resolvePoint(loc: LocState): { name: string; kind: Hub["kind"]; lat: number; lng: number } | null {
  if (loc.hubId === CUSTOM_ID) {
    if (!loc.custom.trim()) return null;
    return {
      name: loc.custom.trim(),
      kind: "custom",
      ...hashOffset(loc.custom.trim().toLowerCase()),
    };
  }
  const hub = hubs.find((h) => h.id === loc.hubId);
  if (!hub) return null;
  return hub;
}

function LocationFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocState;
  onChange: (next: LocState) => void;
}) {
  return (
    <div className="grid-2">
      <label>
        {label}
        <select
          value={value.hubId}
          onChange={(e) => onChange({ ...value, hubId: e.target.value })}
        >
          <option value="">Choose a pin</option>
          {hubs.map((hub) => (
            <option key={hub.id} value={hub.id}>
              {hub.name} · {kindLabel[hub.kind]}
            </option>
          ))}
          <option value={CUSTOM_ID}>Custom Orlando address</option>
        </select>
      </label>
      {value.hubId === CUSTOM_ID && (
        <label>
          Street / hotel / terminal
          <input
            value={value.custom}
            onChange={(e) => onChange({ ...value, custom: e.target.value })}
            placeholder="e.g. 5400 Stardust Ln, Orlando"
          />
        </label>
      )}
    </div>
  );
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Book() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pickup, setPickup] = useState<LocState>({
    hubId: params.get("from") ?? "",
    custom: "",
  });
  const [dropoff, setDropoff] = useState<LocState>({
    hubId: params.get("to") ?? "",
    custom: "",
  });
  const [vehicle, setVehicle] = useState<VehicleType>(
    params.get("vehicle") === "model-y" ? "model-y" : "cybercab",
  );
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 20);
    d.setSeconds(0, 0);
    return toLocalInput(d);
  });
  const [passengers, setPassengers] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const quote = useMemo(() => {
    const from = resolvePoint(pickup);
    const to = resolvePoint(dropoff);
    if (!from || !to) return null;
    const miles = from.name === to.name ? 2.4 : haversineMiles(from, to);
    return quoteTrip({
      miles,
      vehicle,
      when: new Date(when),
      pickupKind: from.kind,
      dropoffKind: to.kind,
    });
  }, [pickup, dropoff, vehicle, when]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const from = resolvePoint(pickup);
    const to = resolvePoint(dropoff);
    if (!from || !to) {
      setError("Pick a pickup and drop-off.");
      return;
    }
    if (from.name === to.name && pickup.hubId !== CUSTOM_ID) {
      setError("Pickup and drop-off need to be different.");
      return;
    }
    if (!quote) return;
    const maxSeats = vehicle === "cybercab" ? 2 : 5;
    if (passengers < 1 || passengers > maxSeats) {
      setError(`This vehicle holds ${maxSeats} passengers.`);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required so dispatch can reach you.");
      return;
    }
    const ride = createRide({
      id: makeRideId(),
      createdAt: new Date().toISOString(),
      pickup: from.name,
      dropoff: to.name,
      when: new Date(when).toISOString(),
      vehicle,
      passengers,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      quote,
      assignedVehicle: assignVehicle(vehicle),
      status: "confirmed",
    });
    navigate(`/rides/${ride.id}`);
  }

  return (
    <section className="section">
      <div className="shell">
        <p className="kicker">Request a vehicle</p>
        <div className="section-head">
          <h2>Book an Orlando ride</h2>
          <p className="muted tiny">Quotes are instant. Confirmation lives on this device.</p>
        </div>
        <form className="grid-2" onSubmit={onSubmit}>
          <div className="panel form">
            <LocationFields label="Pickup" value={pickup} onChange={setPickup} />
            <LocationFields label="Drop-off" value={dropoff} onChange={setDropoff} />
            <label>
              When
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </label>
            <div>
              <span className="muted tiny">Vehicle</span>
              <div className="choice" style={{ marginTop: 8 }}>
                <button type="button" className={vehicle === "cybercab" ? "on" : ""} onClick={() => setVehicle("cybercab")}>
                  <CybercabArt />
                  <strong>{vehicleCopy.cybercab.label}</strong>
                  <div className="tiny muted">{vehicleCopy.cybercab.capacity}</div>
                </button>
                <button type="button" className={vehicle === "model-y" ? "on" : ""} onClick={() => setVehicle("model-y")}>
                  <ModelYArt />
                  <strong>{vehicleCopy["model-y"].label}</strong>
                  <div className="tiny muted">{vehicleCopy["model-y"].capacity}</div>
                </button>
              </div>
            </div>
            <label>
              Passengers
              <input
                type="number"
                min={1}
                max={vehicle === "cybercab" ? 2 : 5}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="panel form">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label>
              Mobile
              <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="(407)" />
            </label>
            <label>
              Email (optional)
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <label>
              Notes
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Stroller, terminal, hotel porte-cochère…" />
            </label>
            {quote ? (
              <div className="quote">
                <div>
                  <span>{quote.miles} mi · {quote.minutes} min</span>
                  <span>{quote.peak ? "Peak" : "Off-peak"}</span>
                </div>
                <div>
                  <span>Base</span>
                  <span>{formatUsd(quote.base)}</span>
                </div>
                <div>
                  <span>Distance</span>
                  <span>{formatUsd(quote.distance)}</span>
                </div>
                {quote.extras.map((extra) => (
                  <div key={extra.label}>
                    <span>{extra.label}</span>
                    <span>{formatUsd(extra.amount)}</span>
                  </div>
                ))}
                <div className="total">
                  <span>Total</span>
                  <span>{formatUsd(quote.total)}</span>
                </div>
              </div>
            ) : (
              <p className="muted tiny">Choose both ends of the trip to see a fare.</p>
            )}
            {error && <div className="error">{error}</div>}
            <button className="btn primary" type="submit" disabled={!quote}>
              Confirm ride
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
