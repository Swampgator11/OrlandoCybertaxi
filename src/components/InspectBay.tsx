import { lazy, Suspense, useState } from "react";
import type { Paint, VehicleType } from "../data/fleet";
import { inspectModes, modePlaque, stillsFor, type InspectMode } from "../data/inspectViews";

const VehicleViewer = lazy(() => import("./VehicleViewer"));
const StillViewer = lazy(() => import("./StillViewer"));

type Props = {
  type: VehicleType;
  paint: Paint;
  autoRotate?: boolean;
  initialView?: InspectMode;
  onViewChange?: (view: InspectMode) => void;
};

export default function InspectBay({ type, paint, autoRotate, initialView = "exterior", onViewChange }: Props) {
  const [view, setView] = useState<InspectMode>(initialView);

  function choose(next: InspectMode) {
    setView(next);
    onViewChange?.(next);
  }

  const stills = stillsFor(type, view);

  return (
    <div className="inspect-bay">
      <div className="view-modes" role="tablist" aria-label="Inspect mode">
        {inspectModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={view === mode.id}
            className={view === mode.id ? "on" : ""}
            onClick={() => choose(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <Suspense fallback={<div className="viewer-fallback tall" />}>
        {view === "exterior" ? (
          <VehicleViewer type={type} paint={paint} autoRotate={autoRotate} />
        ) : (
          <StillViewer
            stills={stills}
            plaque={modePlaque[view]}
            cover={view === "cabin"}
          />
        )}
      </Suspense>
    </div>
  );
}
