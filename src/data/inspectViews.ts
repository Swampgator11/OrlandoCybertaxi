import type { VehicleType } from "./fleet";

export type InspectMode = "exterior" | "cabin" | "trunk";

export type Still = {
  src: string;
  note: string;
};

export const inspectModes: { id: InspectMode; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "cabin", label: "Sit inside" },
  { id: "trunk", label: "Trunk" },
];

export const cabinStills: Record<VehicleType, Still[]> = {
  cybercab: [
    { src: "/inspect/cybercab/cabin-01.jpg", note: "Two flat seats. No wheel. No pedals." },
    { src: "/inspect/cybercab/cabin-02.jpg", note: "The ~21-inch landscape screen faces both riders." },
    { src: "/inspect/cybercab/cabin-03.jpg", note: "Cupholders and the e-stop sit between the seats." },
    { src: "/inspect/cybercab/cabin-04.jpg", note: "Butterfly door open — step in, sit down." },
    { src: "/inspect/cybercab/cabin-05.jpg", note: "We, Robot cabin. Same two-seat, no-wheel layout." },
  ],
  "model-y": [
    { src: "/inspect/model-y/cabin-01.jpg", note: "Rear bench, glass roof, five seats." },
    { src: "/inspect/model-y/cabin-02.jpg", note: "Looking forward under the panoramic roof." },
    { src: "/inspect/model-y/cabin-03.jpg", note: "Operator seat — yoke, screen, white Juniper cabin." },
    { src: "/inspect/model-y/cabin-04.jpg", note: "From the second row: glass, screen, the road ahead." },
    { src: "/inspect/model-y/cabin-05.jpg", note: "Juniper dash, ambient rail, safety operator aboard." },
  ],
};

export const trunkStills: Record<VehicleType, Still[]> = {
  // No license-clear open-hatch Cybercab photograph exists on Commons / Flickr CC.
  // Closed display-unit rears were removed — a closed tail is not a trunk inspect.
  cybercab: [],
  "model-y": [
    { src: "/inspect/model-y/trunk-01.jpg", note: "Liftgate up — cargo well behind the rear bench, not a sedan slit." },
    { src: "/inspect/model-y/trunk-02.jpg", note: "Hatch raised on the grey Y. Groceries, strollers, park bags go here." },
    { src: "/inspect/model-y/trunk-03.jpg", note: "Power liftgate open onto the cargo floor and parcel shelf." },
  ],
};

export const trunkEmptyNote: Partial<Record<VehicleType, string>> = {
  cybercab:
    "No license-clear open-hatch photograph is on file. Production wells are a durable cargo floor behind the two seats, watched by an interior trunk camera.",
};

export const modePlaque: Record<InspectMode, string> = {
  exterior: "Drag to orbit · pinch or scroll to zoom · real photographs",
  cabin: "Sit inside · drag or step to look around · real photographs",
  trunk: "Trunk and hatch · step through · real photographs",
};

export function stillsFor(type: VehicleType, mode: InspectMode): Still[] {
  if (mode === "cabin") return cabinStills[type];
  if (mode === "trunk") return trunkStills[type];
  return [];
}
