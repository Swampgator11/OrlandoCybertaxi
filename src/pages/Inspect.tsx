import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { Paint, VehicleType } from "../data/fleet";

const VehicleViewer = lazy(() => import("../components/VehicleViewer"));

export default function Inspect() {
  const { type } = useParams();
  const [params] = useSearchParams();
  const vehicle: VehicleType = type === "model-y" ? "model-y" : "cybercab";
  const initial = (params.get("paint") as Paint | null) ?? (vehicle === "cybercab" ? "gold" : "white");
  const [paint, setPaint] = useState<Paint>(initial);
  const paints = useMemo<Paint[]>(
    () => (vehicle === "cybercab" ? ["gold", "white"] : ["white", "grey"]),
    [vehicle],
  );

  return (
    <section className="inspect">
      <div className="inspect-bar">
        <p className="kicker">{vehicle === "cybercab" ? "Cybercab" : "Model Y"}</p>
        <div className="chips">
          {paints.map((p) => (
            <button key={p} type="button" className={paint === p ? "on" : ""} onClick={() => setPaint(p)}>
              {p === "gold" ? "Champagne" : p === "grey" ? "Stealth" : "Pearl"}
            </button>
          ))}
        </div>
        <Link className="btn primary" to={`/book?vehicle=${vehicle}`}>
          Book this vehicle
        </Link>
      </div>
      <Suspense fallback={<div className="viewer-fallback tall" />}>
        <VehicleViewer type={vehicle} paint={paint} autoRotate />
      </Suspense>
    </section>
  );
}
