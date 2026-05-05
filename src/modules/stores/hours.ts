import type { Opening, WeekDay } from "./types";

export function isStoreOpen(opening: Opening, now: Date = new Date()): boolean {
  const day = String(now.getDay()) as WeekDay;
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;
  const slots = opening.weekly[day] ?? [];
  return slots.some((s) => current >= s.open && current < s.close);
}
