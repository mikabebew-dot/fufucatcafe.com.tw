import "server-only";
import { createClient } from "next-sanity";
import { isBrand, type BrandId } from "@/lib/constants";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { isLang, type Lang } from "./content";

/**
 * 入場確認紀錄存在 Sanity，每店每天一份文件：checkin.day.<店>.<日期>。
 * ID 含「.」的文件只有帶 token 或登入後台的人讀得到，所以不會出現在公開 API。
 * 只記錄：確認時間、語言、各方案人數、確認碼、認養資訊點閱。不記錄姓名、電話等個資。
 */
export function checkinClient() {
  // 與養貓前必修課共用同一組 Editor token（另外設定 SANITY_CHECKIN_TOKEN 時以它為準）
  const token = process.env.SANITY_CHECKIN_TOKEN || process.env.SANITY_ACADEMY_TOKEN;
  if (!token) return undefined;
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
}

export const taipeiDate = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export const dayId = (brand: BrandId, date = taipeiDate()) => `checkin.day.${brand}.${date}`;

export type Entry = { _key: string; code: string; at: string; lang: Lang; short: number; long: number; entered?: boolean };
export type Day = {
  _id: string;
  brand: BrandId;
  date: string;
  groups?: number;
  guests?: number;
  planShort?: number;
  planLong?: number;
  langs?: Partial<Record<Lang, number>>;
  adoptClicks?: number;
  adoptPage?: number;
  fosterViews?: number;
  catClicks?: Record<string, number>;
  entries?: Entry[];
};

export type ConfirmInput = { brand: BrandId; lang: Lang; short: number; long: number };

const int = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : NaN);

export function parseConfirm(body: unknown): ConfirmInput | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  const short = int(b.short);
  const long = int(b.long);
  if (typeof b.brand !== "string" || !isBrand(b.brand) || !isLang(b.lang)) return undefined;
  if (!(short >= 0 && long >= 0 && short + long >= 1 && short + long <= 20)) return undefined;
  return { brand: b.brand, lang: b.lang, short, long };
}

const newCode = (taken: Set<string>) => {
  for (let i = 0; i < 30; i++) {
    const c = String(1000 + Math.floor(Math.random() * 9000));
    if (!taken.has(c)) return c;
  }
  return String(1000 + Math.floor(Math.random() * 9000));
};

/** 新增一組確認；回傳確認碼 */
export async function recordConfirm(input: ConfirmInput) {
  const client = checkinClient();
  if (!client) return undefined;
  const id = dayId(input.brand);
  const existing = await client.fetch<string[] | null>(`*[_id == $id][0].entries[].code`, { id });
  const code = newCode(new Set(existing ?? []));
  const entry: Entry = {
    _key: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    code,
    at: new Date().toISOString(),
    lang: input.lang,
    short: input.short,
    long: input.long,
  };
  await client
    .transaction()
    .createIfNotExists({
      _id: id, _type: "checkinDayStat", brand: input.brand, date: taipeiDate(),
      groups: 0, guests: 0, planShort: 0, planLong: 0, adoptClicks: 0, adoptPage: 0,
      langs: { zh: 0, en: 0, ja: 0, ko: 0 }, catClicks: {}, entries: [],
    })
    .patch(id, (p) =>
      p
        .setIfMissing({ entries: [], langs: {} })
        .inc({ groups: 1, guests: input.short + input.long, planShort: input.short, planLong: input.long })
        .setIfMissing({ [`langs.${input.lang}`]: 0 })
        .inc({ [`langs.${input.lang}`]: 1 })
        .append("entries", [entry]),
    )
    .commit({ visibility: "sync" });
  return entry;
}

/** 認養資訊的點閱：cat 為貓咪網址代稱，"page" 代表認養流程頁，"view" 代表打開「等家的孩子」頁 */
export async function recordAdoptClick(brand: BrandId, cat: string) {
  const client = checkinClient();
  if (!client) return false;
  const id = dayId(brand);
  const key = cat === "page" ? "" : cat.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
  await client
    .transaction()
    .createIfNotExists({ _id: id, _type: "checkinDayStat", brand, date: taipeiDate(), groups: 0, guests: 0, adoptClicks: 0, adoptPage: 0, catClicks: {}, entries: [] })
    .patch(id, (p) => {
      let q = p.setIfMissing({ adoptClicks: 0, adoptPage: 0, fosterViews: 0, catClicks: {} });
      if (cat === "view") return q.inc({ fosterViews: 1 });
      if (!key) return q.inc({ adoptPage: 1 });
      q = q.inc({ adoptClicks: 1 }).setIfMissing({ [`catClicks.${key}`]: 0 }).inc({ [`catClicks.${key}`]: 1 });
      return q;
    })
    .commit({ visibility: "async" });
  return true;
}

export async function getToday(brand: BrandId) {
  const client = checkinClient();
  if (!client) return undefined;
  return client.fetch<Day | null>(`*[_id == $id][0]`, { id: dayId(brand) });
}

/** 櫃檯按「已入場」：標記某一組 */
export async function markEntered(brand: BrandId, key: string, entered: boolean) {
  const client = checkinClient();
  if (!client || !/^[a-z0-9]{6,20}$/.test(key)) return false;
  await client.patch(dayId(brand)).set({ [`entries[_key=="${key}"].entered`]: entered }).commit({ visibility: "sync" });
  return true;
}
