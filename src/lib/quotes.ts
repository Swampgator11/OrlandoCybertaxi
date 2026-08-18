import type { LocationKind } from "../data/locations";
import type { VehicleType } from "../data/fleet";
import { estimateMinutes } from "./geo";

export type QuoteInput = {
  miles: number;
  vehicle: VehicleType;
  when: Date;
  pickupKind: LocationKind;
  dropoffKind: LocationKind;
};

export type Quote = {
  miles: number;
  minutes: number;
  peak: boolean;
  base: number;
  distance: number;
  extras: { label: string; amount: number }[];
  total: number;
};

const RATES = {
  cybercab: { base: 4.5, perMile: 1.15 },
  "model-y": { base: 7.0, perMile: 1.65 },
} as const;

function isPeak(when: Date): boolean {
  const h = when.getHours();
  const day = when.getDay();
  const weekday = day >= 1 && day <= 5;
  if (weekday && ((h >= 7 && h < 9) || (h >= 16 && h < 19))) return true;
  if (h >= 21 && h < 23) return true;
  return false;
}

function zoneFee(kind: LocationKind): { label: string; amount: number } | null {
  if (kind === "airport") return { label: "Airport pickup", amount: 6 };
  if (kind === "theme-park") return { label: "Theme-park zone", amount: 4 };
  if (kind === "venue") return { label: "Venue staging", amount: 3 };
  return null;
}

export function quoteTrip(input: QuoteInput): Quote {
  const peak = isPeak(input.when);
  const rates = RATES[input.vehicle];
  const miles = Math.max(1.2, input.miles);
  const minutes = estimateMinutes(miles, peak);
  const distance = miles * rates.perMile;
  const extras: { label: string; amount: number }[] = [];

  const pickupFee = zoneFee(input.pickupKind);
  const dropFee = zoneFee(input.dropoffKind);
  if (pickupFee) extras.push(pickupFee);
  if (dropFee && dropFee.label !== pickupFee?.label) extras.push({
    ...dropFee,
    label: dropFee.label.replace("pickup", "drop-off"),
  });
  if (peak) extras.push({ label: "Peak demand", amount: Math.round(rates.base * 0.35 * 100) / 100 });

  const extraTotal = extras.reduce((sum, e) => sum + e.amount, 0);
  const total =
    Math.round((rates.base + distance + extraTotal) * 100) / 100;

  return {
    miles: Math.round(miles * 10) / 10,
    minutes,
    peak,
    base: rates.base,
    distance: Math.round(distance * 100) / 100,
    extras,
    total,
  };
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
