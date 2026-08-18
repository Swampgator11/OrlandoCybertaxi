export type VehicleType = "cybercab" | "model-y";

export type Vehicle = {
  id: string;
  type: VehicleType;
  name: string;
  seats: number;
  notes: string;
};

export const fleet: Vehicle[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `CC-${String(i + 1).padStart(2, "0")}`,
    type: "cybercab" as const,
    name: `Cybercab ${String(i + 1).padStart(2, "0")}`,
    seats: 2,
    notes: "Fully autonomous two-seater. No steering wheel.",
  })),
  {
    id: "MY-01",
    type: "model-y",
    name: "Model Y 01",
    seats: 5,
    notes: "Family, luggage, and accessibility trips with a safety operator.",
  },
  {
    id: "MY-02",
    type: "model-y",
    name: "Model Y 02",
    seats: 5,
    notes: "Airport runs, car seats, and groups up to five.",
  },
];

export const vehicleCopy: Record<
  VehicleType,
  { label: string; blurb: string; capacity: string }
> = {
  cybercab: {
    label: "Cybercab",
    blurb: "Two seats. Stainless body. No driver. Built for city hops and park-to-hotel runs.",
    capacity: "2 passengers",
  },
  "model-y": {
    label: "Model Y",
    blurb: "Five seats, cargo, car seats, and wheelchairs that fold. Safety operator on board.",
    capacity: "5 passengers + cargo",
  },
};
