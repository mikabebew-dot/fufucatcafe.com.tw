import { DAYS, type DayKey } from "./constants";
import type { HoursRow, SpecialDate } from "./types";

/** 台北現在的星期、日期與分鐘數 */
function nowInTaipei(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday").toLowerCase().slice(0, 3) as DayKey;
  return { day, date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (t?: string) => {
  if (!t) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export type OpenState =
  | { kind: "open"; until: string; special: boolean }
  | { kind: "before"; opens: string; special: boolean }
  | { kind: "after" }
  | { kind: "closed" }
  | { kind: "unknown" };

/** 依每週營業時間＋特別營業日，算出台北「此刻」的營業狀態 */
export function openState(hoursIn?: HoursRow[] | null, specialIn?: SpecialDate[] | null, now = new Date()): OpenState {
  const hours = hoursIn ?? [];
  const special = specialIn ?? [];
  const { day, date, minutes } = nowInTaipei(now);
  const sp = special.find((s) => s.date === date);
  const row = sp
    ? { closed: sp.closed, open: sp.open, close: sp.close }
    : hours.find((h) => h.day === day);
  if (!row) return hours.length ? { kind: "closed" } : { kind: "unknown" };
  if (row.closed) return { kind: "closed" };
  const o = toMin(row.open), c = toMin(row.close);
  if (Number.isNaN(o) || Number.isNaN(c)) return { kind: "unknown" };
  if (minutes < o) return { kind: "before", opens: row.open!, special: Boolean(sp) };
  if (minutes < c) return { kind: "open", until: row.close!, special: Boolean(sp) };
  return { kind: "after" };
}

/** 把每週時間整理成「週一–週五 11:00–20:00」這類分組，給表格與結構化資料用 */
export function groupHours(hoursIn?: HoursRow[] | null) {
  const hours = hoursIn ?? [];
  const ordered = DAYS.map((d) => hours.find((h) => h.day === d.value)).filter(Boolean) as HoursRow[];
  const groups: { days: DayKey[]; closed: boolean; open?: string; close?: string }[] = [];
  for (const h of ordered) {
    const last = groups.at(-1);
    const same = last && last.closed === Boolean(h.closed) && last.open === h.open && last.close === h.close;
    const adjacent = last && DAYS.findIndex((d) => d.value === last.days.at(-1)) + 1 === DAYS.findIndex((d) => d.value === h.day);
    if (same && adjacent) last.days.push(h.day);
    else groups.push({ days: [h.day], closed: Boolean(h.closed), open: h.open, close: h.close });
  }
  return groups;
}
