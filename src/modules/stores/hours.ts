import type { Opening, WeekDay } from "./types";

const STORE_TIME_ZONE = "Asia/Taipei";

const WEEKDAY_TO_INDEX: Record<string, WeekDay> = {
  Sun: "0",
  Mon: "1",
  Tue: "2",
  Wed: "3",
  Thu: "4",
  Fri: "5",
  Sat: "6",
};

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: STORE_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function isStoreOpen(opening: Opening, now: Date = new Date()): boolean {
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const day = WEEKDAY_TO_INDEX[weekday];
  if (!day) return false;
  const current = `${hour === "24" ? "00" : hour}:${minute}`;
  const slots = opening.weekly[day] ?? [];
  return slots.some((s) => current >= s.open && current < s.close);
}
