import { Link } from "react-router-dom";
import { company } from "../data/company";
import { VehiclePortrait } from "../components/VehicleArt";

export default function Home() {
  return (
    <>
      <section className="hero-stage">
        <img
          className="hero-photo"
          src="/fleet/hero-cybercab-orlando.webp"
          alt="Champagne Tesla Cybercab on a wet Orlando night"
        />
        <div className="hero-veil" />
        <div className="hero-scan" />
        <div className="shell hero-copy">
          <p className="kicker pulse">Greater Orlando · unsupervised two-seaters · 24/7</p>
          <h1>
            Gold Cybercabs.
            <br />
            <em>Orlando after dark.</em>
          </h1>
          <p className="lede">
            Ten Tesla Cybercabs — butterfly doors, lounge bench, no steering wheel —
            plus two Juniper Model Ys for the party, the stroller, and MCO.
          </p>
          <div className="row" style={{ marginTop: 22 }}>
            <Link className="btn primary shine" to="/book">
              Book a ride
            </Link>
            <Link className="btn ghost" to="/fleet">
              Walk the hangar
            </Link>
          </div>
        </div>
      </section>

      <section className="section stats-band">
        <div className="shell stats">
          <div className="stat">
            <b>{company.fleet.cybercab}</b>
            <span>Cybercabs</span>
          </div>
          <div className="stat">
            <b>{company.fleet.modelY}</b>
            <span>Model Y Juniper</span>
          </div>
          <div className="stat">
            <b>2</b>
            <span>Seats in a Cybercab</span>
          </div>
          <div className="stat">
            <b>5</b>
            <span>Seats in a Model Y</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">The actual cars</p>
              <h2>Not a pod. Not a minivan.</h2>
            </div>
          </div>
          <div className="grid-2 lineup">
            <Link to="/book?vehicle=cybercab" className="panel vehicle-feature">
              <VehiclePortrait type="cybercab" paint="gold" alt="Champagne Tesla Cybercab" />
              <div>
                <p className="kicker">CC-01 → CC-10</p>
                <h3>Cybercab</h3>
                <p className="muted">
                  Teardrop two-seater. Champagne or pearl unpainted body, aero discs,
                  butterfly doors, 24-inch cabin screen. Built as a robotaxi from scratch.
                </p>
              </div>
            </Link>
            <Link to="/book?vehicle=model-y" className="panel vehicle-feature">
              <VehiclePortrait type="model-y" paint="white" alt="Pearl White Tesla Model Y" />
              <div>
                <p className="kicker">MY-01 · MY-02</p>
                <h3>Model Y Juniper</h3>
                <p className="muted">
                  Full-width light bar, glass roof, five seats and a trunk. Pearl White
                  and Stealth Grey, with a safety operator for luggage and car seats.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
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
              <article className="panel glow-card" key={title}>
                <h3>{title}</h3>
                <p className="muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
