const DAY_MS = 86_400_000;

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const relativeTime = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

function utcMidnight(value: string): number {
  const parts = value.slice(0, 10).split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return Date.UTC(year, month - 1, day);
}

export function formatDate(iso: string): string {
  return fullDate.format(new Date(iso));
}

export function dayDelta(target: string, reference: Date): number {
  return Math.round((utcMidnight(target) - utcMidnight(reference.toISOString())) / DAY_MS);
}

export function formatDueLabel(dueDate: string, reference: Date): string {
  const delta = dayDelta(dueDate, reference);
  if (delta === 0) return "Due today";
  if (delta === 1) return "Due tomorrow";
  if (delta > 1) return `Due in ${delta} days`;
  const overdue = Math.abs(delta);
  return overdue === 1 ? "1 day overdue" : `${overdue} days overdue`;
}

export function formatReceived(iso: string, reference: Date): string {
  const delta = dayDelta(iso, reference);
  if (delta === 0) return "Today";
  if (delta >= -6 && delta < 0) return relativeTime.format(delta, "day");
  return formatDate(iso);
}
