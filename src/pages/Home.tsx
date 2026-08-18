import { Link } from "react-router-dom";
import { company } from "../data/company";
import { CybercabArt, ModelYArt } from "../components/VehicleArt";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="horizon" />
        <div className="shell hero-grid">
          <div>
            <p className="kicker">Greater Orlando · 24/7</p>
            <h1>
              Robotaxi to the parks.
              <br />
              <em>Model Y to MCO.</em>
            </h1>
            <p className="lede">
              Orlando Cybertaxi runs a private fleet of {company.fleet.cybercab} Tesla
              Cybercabs and {company.fleet.modelY} Model Y vehicles. Two-seat autonomy
              for most trips. Five seats and cargo when the whole party is coming.
            </p>
            <div className="row" style={{ marginTop: 22 }}>
              <Link className="btn primary" to="/book">
                Book a ride
              </Link>
              <Link className="btn ghost" to="/fleet">
                See the hangar
              </Link>
            </div>
            <div className="stats">
              <div className="stat">
                <b>{company.fleet.cybercab}</b>
                <span>Cybercabs</span>
              </div>
              <div className="stat">
                <b>{company.fleet.modelY}</b>
                <span>Model Y</span>
              </div>
              <div className="stat">
                <b>2</b>
                <span>Seats, Cybercab</span>
              </div>
              <div className="stat">
                <b>5</b>
                <span>Seats, Model Y</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <p className="kicker">Right now</p>
            <h3>Pick the shape of the trip</h3>
            <div className="choice" style={{ marginTop: 16 }}>
              <Link to="/book?vehicle=cybercab" className="panel" style={{ padding: 12, boxShadow: "none" }}>
                <CybercabArt />
                <strong>Cybercab</strong>
                <p className="tiny muted">Couples, solo riders, hotel ↔ park.</p>
              </Link>
              <Link to="/book?vehicle=model-y" className="panel" style={{ padding: 12, boxShadow: "none" }}>
                <ModelYArt />
                <strong>Model Y</strong>
                <p className="tiny muted">Airport bags, car seats, up to five.</p>
              </Link>
            </div>
            <p className="tiny muted" style={{ marginTop: 16 }}>
              Dispatch {company.phone} · {company.hub}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">How it works</p>
              <h2>Pin, quote, roll.</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              ["1. Pin both ends", "MCO, Magic Kingdom, CityWalk, Lake Eola, or any Orlando address."],
              ["2. Match the vehicle", "Cybercab if it is two of you. Model Y if you have luggage or a crew."],
              ["3. Hold the receipt", "You get a fare, an assigned car from the live hangar, and a trip ID."],
            ].map(([title, body]) => (
              <article className="panel" key={title}>
                <h3>{title}</h3>
                <p className="muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell grid-2">
          <article className="panel">
            <p className="kicker">Fares</p>
            <h2>Clear numbers.</h2>
            <p className="muted">
              Cybercab from $4.50 + $1.15/mi. Model Y from $7.00 + $1.65/mi. Airport,
              theme-park, and peak windows add a published extra — no surge black box.
            </p>
            <Link className="btn ghost" to="/book">
              Price a trip
            </Link>
          </article>
          <article className="panel">
            <p className="kicker">Coverage</p>
            <h2>I-4, the parks, the airport.</h2>
            <p className="muted">
              Lake Nona hub to Disney, Universal, I-Drive, downtown, Winter Park, and
              Kissimmee. Custom drop-offs anywhere in Greater Orlando.
            </p>
            <Link className="btn ghost" to="/coverage">
              Open the map
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
