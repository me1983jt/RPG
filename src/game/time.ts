/** Real seconds in one in-game day. Change this number later to retune the clock. */
/** v14.1: slowed from 12 to 20 real minutes per in-game day. */
export const DAY_LENGTH_SEC = 20 * 60;

/** Day 1 starts at 7:00. */
export function morningClock(): number {
  return DAY_LENGTH_SEC * (7 / 24);
}

export function clockLabel(totalSec: number): string {
  const span = DAY_LENGTH_SEC;
  const day = Math.floor(totalSec / span) + 1;
  const into = ((totalSec % span) + span) % span;
  const hourFloat = (into / span) * 24;
  const hour = Math.floor(hourFloat);
  const minute = Math.floor((hourFloat - hour) * 60);
  return `Day ${day} · ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** 0 at noon, 1 at midnight. */
export function nightShade(totalSec: number): number {
  const span = DAY_LENGTH_SEC;
  const into = ((totalSec % span) + span) % span;
  const hour = (into / span) * 24;
  return Math.max(0, Math.cos((hour / 24) * Math.PI * 2));
}
