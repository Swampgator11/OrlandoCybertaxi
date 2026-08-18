import type { VehicleType } from "../data/fleet";
import type { Quote } from "./quotes";

export type RideStatus = "confirmed" | "dispatched" | "complete" | "canceled";

export type Ride = {
  id: string;
  createdAt: string;
  pickup: string;
  dropoff: string;
  when: string;
  vehicle: VehicleType;
  passengers: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  quote: Quote;
  assignedVehicle: string;
  status: RideStatus;
};

const KEY = "oct-rides-v1";

function load(): Ride[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ride[]) : [];
  } catch {
    return [];
  }
}

function save(rides: Ride[]) {
  localStorage.setItem(KEY, JSON.stringify(rides));
}

export function listRides(): Ride[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRide(id: string): Ride | undefined {
  return load().find((r) => r.id === id);
}

export function createRide(ride: Ride): Ride {
  const rides = load();
  rides.push(ride);
  save(rides);
  return ride;
}

export function updateRideStatus(id: string, status: RideStatus): Ride | undefined {
  const rides = load();
  const next = rides.map((r) => (r.id === id ? { ...r, status } : r));
  save(next);
  return next.find((r) => r.id === id);
}

export function makeRideId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) token += alphabet[b % alphabet.length];
  return `OCT-${token}`;
}
