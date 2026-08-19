import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { Paint, VehicleType } from "../data/fleet";
import type { InspectMode } from "../data/inspectViews";

const InspectBay = lazy(() => import("../components/InspectBay"));

function parseView(raw: string | null): InspectMode {
  if (raw === "cabin" || raw === "trunk" || raw === "exterior") return raw;
  return "exterior";
}

export default function Inspect() {
  const { type } = useParams();
  const [params, setParams] = useSearchParams();
  const vehicle: VehicleType = type === "model-y" ? "model-y" : "cybercab";
  const initial = (params.get("paint") as Paint | null) ?? (vehicle === "cybercab" ? "gold" : "white");
  const [paint, setPaint] = useState<Paint>(initial);
  const view = parseView(params.get("view"));
  const paints = useMemo<Paint[]>(
    () => (vehicle === "cybercab" ? ["gold", "white"] : ["white", "grey"]),
    [vehicle],
  );

  return (
    <section className="inspect">
      <div className="inspect-bar">
        <p className="kicker">{vehicle === "cybercab" ? "Inspection bay · Cybercab" : "Inspection bay · Model Y"}</p>
        <div className="chips">
          {paints.map((p) => (
            <button key={p} type="button" className={paint === p ? "on" : ""} onClick={() => setPaint(p)}>
              {p === "gold" ? "Champagne" : p === "grey" ? "Stealth" : "Pearl"}
            </button>
          ))}
        </div>
        <Link className="btn primary" to={`/book?vehicle=${vehicle}`}>
          Reserve this vehicle
        </Link>
      </div>
      <Suspense fallback={<div className="viewer-fallback tall" />}>
        <InspectBay
          type={vehicle}
          paint={paint}
          autoRotate
          initialView={view}
          onViewChange={(next) => {
            const nextParams = new URLSearchParams(params);
            if (next === "exterior") nextParams.delete("view");
            else nextParams.set("view", next);
            setParams(nextParams, { replace: true });
          }}
        />
      </Suspense>
    </section>
  );
}
