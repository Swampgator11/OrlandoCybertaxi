import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import CabinFilm from "../components/CabinFilm";
import { company } from "../data/company";
import type { Paint } from "../data/fleet";

const InspectBay = lazy(() => import("../components/InspectBay"));

export default function Home() {
  const [cabPaint, setCabPaint] = useState<Paint>("gold");
  const [yPaint, setYPaint] = useState<Paint>("white");

  return (
    <>
      <section className="stage">
        <div className="stage-copy">
          <p className="kicker">Lake Nona hangar · 10 Cybercab · 2 Model Y</p>
          <h1>Cybercab</h1>
          <p className="lede">
            Two seats. No wheel. Sit inside, check the cargo well, or orbit the body —
            real photographs, hangar light.
          </p>
          <div className="chips">
            <button type="button" className={cabPaint === "gold" ? "on" : ""} onClick={() => setCabPaint("gold")}>
              Champagne
            </button>
            <button type="button" className={cabPaint === "white" ? "on" : ""} onClick={() => setCabPaint("white")}>
              Pearl
            </button>
          </div>
          <div className="row">
            <Link className="btn primary" to="/book?vehicle=cybercab">
              Reserve
            </Link>
            <Link className="btn ghost" to="/inspect/cybercab">
              Inspect
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="viewer-fallback tall" />}>
          <InspectBay type="cybercab" paint={cabPaint} />
        </Suspense>
      </section>

      <CabinFilm
        src="/film/cybercab-cabin.mp4"
        poster="/film/cabin-cybercab-a.jpg"
        caption="Cybercab cabin — two flat seats, landscape center display, butterfly door, no steering wheel."
      />

      <section className="section hail-band">
        <div className="shell grid-2">
          <article className="panel">
            <p className="kicker">Tesla Robotaxi app</p>
            <h3>Hail when you want the car</h3>
            <p className="muted">{company.hail}</p>
          </article>
          <article className="panel">
            <p className="kicker">This hangar</p>
            <h3>Reserve hours ahead</h3>
            <p className="muted">{company.reserve}</p>
            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn primary" to="/book">
                File a reservation
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="stage invert">
        <Suspense fallback={<div className="viewer-fallback tall" />}>
          <InspectBay type="model-y" paint={yPaint} />
        </Suspense>
        <div className="stage-copy">
          <p className="kicker">MY-01 · MY-02 · operator aboard</p>
          <h1>Model Y</h1>
          <p className="lede">
            Five seats, glass roof, a proper cargo hatch. Pearl or stealth. Safety
            operator on board.
          </p>
          <div className="chips">
            <button type="button" className={yPaint === "white" ? "on" : ""} onClick={() => setYPaint("white")}>
              Pearl
            </button>
            <button type="button" className={yPaint === "grey" ? "on" : ""} onClick={() => setYPaint("grey")}>
              Stealth
            </button>
          </div>
          <div className="row">
            <Link className="btn primary" to="/book?vehicle=model-y">
              Reserve
            </Link>
            <Link className="btn ghost" to="/inspect/model-y">
              Inspect
            </Link>
          </div>
        </div>
      </section>

      <CabinFilm
        src="/film/modely-cabin.mp4"
        poster="/film/cabin-modely-a.jpg"
        caption="Model Y cabin — panoramic glass roof, five seats, operator yoke."
      />

      <section className="section">
        <div className="shell">
          <p className="kicker">The hangar</p>
          <h2>{company.fleet.total} vehicles. One city.</h2>
          <div className="stats">
            <div className="stat">
              <b>10</b>
              <span>Cybercab</span>
            </div>
            <div className="stat">
              <b>2</b>
              <span>Model Y</span>
            </div>
            <div className="stat">
              <b>2</b>
              <span>Seats, cab</span>
            </div>
            <div className="stat">
              <b>5</b>
              <span>Seats, Y</span>
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 36 }}>
            {[
              ["Pin both ends", "MCO, the parks, downtown, or any Orlando address."],
              ["Match the vehicle", "Cybercab for two. Model Y for luggage and a crew."],
              ["Hours ahead, not now", "Robotaxi app for a street hail. This desk for a reservation."],
            ].map(([title, body]) => (
              <article className="panel" key={title}>
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
