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
  cybercab: [
    { src: "/inspect/cybercab/trunk-01.jpg", note: "The rear hatch. Production units open this onto a durable cargo well." },
    { src: "/inspect/cybercab/trunk-02.jpg", note: "Hatch at the back of the two-seater — bags go here, not in a lounge." },
    { src: "/inspect/cybercab/trunk-03.jpg", note: "Doors up, hatch at the tail. An interior trunk camera watches the well." },
  ],
  "model-y": [
    { src: "/inspect/model-y/trunk-01.jpg", note: "Hatch and frunk open — conventional cargo, not a sedan slit." },
    { src: "/inspect/model-y/trunk-02.jpg", note: "White Juniper with the liftgate up. Groceries, strollers, park bags." },
    { src: "/inspect/model-y/trunk-03.jpg", note: "The hatch from the street. Power liftgate, glass roof to the tail." },
  ],
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
