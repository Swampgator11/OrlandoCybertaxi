/** This desk is advance reservations — not a street hail. */
export const RESERVE_LEAD_HOURS = 2;
export const RESERVE_DEFAULT_HOURS = 4;

export function roundUpMinutes(date: Date, step = 5): Date {
  const next = new Date(date);
  next.setSeconds(0, 0);
  const extra = next.getMinutes() % step;
  if (extra) next.setMinutes(next.getMinutes() + (step - extra));
  return next;
}

export function earliestPickup(from = new Date()): Date {
  const next = new Date(from);
  next.setHours(next.getHours() + RESERVE_LEAD_HOURS);
  return roundUpMinutes(next);
}

export function defaultPickup(from = new Date()): Date {
  const next = new Date(from);
  next.setHours(next.getHours() + RESERVE_DEFAULT_HOURS);
  return roundUpMinutes(next);
}

export function isHoursAhead(when: Date, from = new Date()): boolean {
  return when.getTime() >= earliestPickup(from).getTime();
}

export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
