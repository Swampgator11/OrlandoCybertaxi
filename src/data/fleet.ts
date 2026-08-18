export type VehicleType = "cybercab" | "model-y";
export type Paint = "gold" | "white" | "grey";

export type Vehicle = {
  id: string;
  type: VehicleType;
  name: string;
  seats: number;
  paint: Paint;
  photo: string;
  notes: string;
};

const CYBERCAB_GOLD = "/film/cabin-cybercab-a.jpg";
const CYBERCAB_WHITE = "/film/cabin-cybercab-b.jpg";
const MODEL_Y_WHITE = "/film/cabin-modely-a.jpg";
const MODEL_Y_GREY = "/film/cabin-modely-b.jpg";

export const fleet: Vehicle[] = [
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    const white = n >= 8;
    return {
      id: `CC-${String(n).padStart(2, "0")}`,
      type: "cybercab" as const,
      name: `Cybercab ${String(n).padStart(2, "0")}`,
      seats: 2,
      paint: (white ? "white" : "gold") as Paint,
      photo: white ? CYBERCAB_WHITE : CYBERCAB_GOLD,
      notes: white
        ? "Pearl unpainted Cybercab. Butterfly doors, lounge bench, no wheel."
        : "Champagne Cybercab. Two-seat robotaxi, teardrop body, aero covers.",
    };
  }),
  {
    id: "MY-01",
    type: "model-y",
    name: "Model Y 01",
    seats: 5,
    paint: "white",
    photo: MODEL_Y_WHITE,
    notes: "Pearl White Juniper. Airport bags, car seats, safety operator.",
  },
  {
    id: "MY-02",
    type: "model-y",
    name: "Model Y 02",
    seats: 5,
    paint: "grey",
    photo: MODEL_Y_GREY,
    notes: "Stealth Grey Juniper. Groups of five and wheelchair-fold cargo.",
  },
];

export const vehicleCopy: Record<
  VehicleType,
  { label: string; blurb: string; capacity: string; photo: string }
> = {
  cybercab: {
    label: "Cybercab",
    blurb: "Tesla’s two-seat robotaxi. Butterfly doors, no steering wheel, champagne or pearl body.",
    capacity: "2 passengers",
    photo: CYBERCAB_GOLD,
  },
  "model-y": {
    label: "Model Y",
    blurb: "Juniper Model Y with a safety operator. Five seats, glass roof, real cargo.",
    capacity: "5 passengers + cargo",
    photo: MODEL_Y_WHITE,
  },
};

export function photoFor(type: VehicleType, paint?: Paint): string {
  if (type === "model-y") return paint === "grey" ? MODEL_Y_GREY : MODEL_Y_WHITE;
  return paint === "white" ? CYBERCAB_WHITE : CYBERCAB_GOLD;
}
