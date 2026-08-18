import { fleet, type Vehicle } from "../data/fleet";

export type FleetStatus = "available" | "en-route" | "charging" | "staged";

export type LiveVehicle = Vehicle & {
  status: FleetStatus;
  etaMin: number | null;
  zone: string;
};

const ZONES = [
  "Lake Nona hub",
  "MCO arrivals",
  "I-Drive corridor",
  "Disney Springs",
  "Universal loop",
  "Downtown / Eola",
  "Winter Park",
  "Kissimmee",
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function liveFleet(now = new Date()): LiveVehicle[] {
  const slot = Math.floor(now.getTime() / (8 * 60 * 1000));
  return fleet.map((vehicle) => {
    const n = hash(`${vehicle.id}:${slot}`);
    const roll = n % 100;
    let status: FleetStatus = "available";
    if (roll < 18) status = "charging";
    else if (roll < 48) status = "en-route";
    else if (roll < 62) status = "staged";

    const zone = ZONES[n % ZONES.length];
    const etaMin = status === "en-route" ? 4 + (n % 18) : status === "staged" ? 2 + (n % 6) : null;

    return { ...vehicle, status, etaMin, zone };
  });
}

export function assignVehicle(type: Vehicle["type"], now = new Date()): string {
  const live = liveFleet(now).filter((v) => v.type === type);
  const preferred = live.find((v) => v.status === "available") ?? live.find((v) => v.status === "staged") ?? live[0];
  return preferred.id;
}

export const statusLabel: Record<FleetStatus, string> = {
  available: "Open",
  "en-route": "On a trip",
  charging: "Charging",
  staged: "Staged",
};
