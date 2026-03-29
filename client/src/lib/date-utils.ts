// All date operations use local time to avoid timezone issues.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

// Parse a YYYY-MM-DD string as local midnight (not UTC)
function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, n: number): string {
  const date = parseLocal(dateStr);
  date.setDate(date.getDate() + n);
  return toDateString(date);
}

export function subtractDays(dateStr: string, n: number): string {
  return addDays(dateStr, -n);
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "Mon, 4/21/26"
export function formatDateNav(dateStr: string): string {
  const d = parseLocal(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  return `${DOW[d.getDay()]}, ${d.getMonth() + 1}/${d.getDate()}/${yy}`;
}

// "Jan 4"
export function formatShortDate(dateStr: string): string {
  const d = parseLocal(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

const DOW_ABBR = ["Su", "M", "T", "W", "Th", "F", "Sa"];

// "T 3/5", "Th 3/7"
export function formatHistoryDate(dateStr: string): string {
  const d = parseLocal(dateStr);
  return `${DOW_ABBR[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

// "Feb 21 '26"
export function formatCompletionDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(2);
  return `${MONTHS[date.getMonth()]} ${date.getDate()} '${yy}`;
}

export function formatNumber(n: number): string {
  return Math.abs(n).toLocaleString();
}

export function formatDeficit(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}${Math.abs(Math.round(n)).toLocaleString()}`;
}
