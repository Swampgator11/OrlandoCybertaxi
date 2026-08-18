import { lazy, Suspense } from "react";
import type { Paint, VehicleType } from "../data/fleet";

const VehicleViewer = lazy(() => import("./VehicleViewer"));

type Props = {
  type: VehicleType;
  paint?: Paint;
  alt: string;
  className?: string;
  compact?: boolean;
};

export function VehiclePortrait({ type, paint = type === "cybercab" ? "gold" : "white", alt, compact = true }: Props) {
  return (
    <div aria-label={alt}>
      <Suspense fallback={<div className="viewer-fallback" />}>
        <VehicleViewer type={type} paint={paint} compact={compact} />
      </Suspense>
    </div>
  );
}

export function CybercabArt() {
  return <VehiclePortrait type="cybercab" paint="gold" alt="Cybercab" />;
}

export function ModelYArt() {
  return <VehiclePortrait type="model-y" paint="white" alt="Model Y" />;
}
