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

export type Entry = {
  _key: string; code: string; at: string; lang: Lang; short: number; long: number;
  entered?: boolean; enteredAt?: string; leftAt?: string;
};
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
  /** 櫃檯按「客滿」：入場頁改顯示候位登記與另一家店 */
  full?: boolean;
  waitlist?: Wait[];
};

/** 候位：電話只給櫃檯打電話用，入座或取消後立刻刪除 */
export type WaitState = "waiting" | "called" | "seated" | "cancelled";
export type Wait = {
  _key: string; no: number; phone?: string; size: number; lang: Lang; at: string;
  state: WaitState; calledAt?: string; doneAt?: string;
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
  // 客人按「確認入場」就算入場，櫃檯不用再按
  const at = new Date().toISOString();
  const entry: Entry = {
    _key: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    code,
    at,
    lang: input.lang,
    short: input.short,
    long: input.long,
    entered: true,
    enteredAt: at,
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

/** 櫃檯按「已入場」／「客人離場」：記錄時間（再按一次可取消） */
export async function markEntry(brand: BrandId, key: string, action: "enter" | "leave", on: boolean) {
  const client = checkinClient();
  if (!client || !/^[a-z0-9]{6,20}$/.test(key)) return false;
  const base = `entries[_key=="${key}"]`;
  const now = new Date().toISOString();
  const patch = client.patch(dayId(brand));
  if (action === "enter") {
    if (on) patch.set({ [`${base}.entered`]: true, [`${base}.enteredAt`]: now });
    else patch.set({ [`${base}.entered`]: false }).unset([`${base}.enteredAt`, `${base}.leftAt`]);
  } else {
    if (on) patch.set({ [`${base}.leftAt`]: now });
    else patch.unset([`${base}.leftAt`]);
  }
  await patch.commit({ visibility: "sync" });
  return true;
}

const emptyDay = (brand: BrandId) => ({
  _id: dayId(brand), _type: "checkinDayStat", brand, date: taipeiDate(),
  groups: 0, guests: 0, planShort: 0, planLong: 0, adoptClicks: 0, adoptPage: 0, catClicks: {}, entries: [],
});

/** 櫃檯密碼（Vercel 環境變數 CHECKIN_COUNTER_PIN）；看候位電話、切換客滿都要 */
export const counterPinOk = (pin: string | null | undefined) => {
  const want = process.env.CHECKIN_COUNTER_PIN;
  return !!want && !!pin && pin === want;
};

/** 公開狀態：只有是否客滿、目前候位幾組，沒有個資 */
export async function getStatus(brand: BrandId) {
  const client = checkinClient();
  if (!client) return { full: false, waiting: 0 };
  const r = await client.fetch<{ full?: boolean; waiting?: number } | null>(
    `*[_id == $id][0]{ full, "waiting": count(waitlist[state in ["waiting","called"]]) }`,
    { id: dayId(brand) },
  );
  return { full: !!r?.full, waiting: r?.waiting ?? 0 };
}

export async function setFull(brand: BrandId, on: boolean) {
  const client = checkinClient();
  if (!client) return false;
  await client.transaction().createIfNotExists(emptyDay(brand)).patch(dayId(brand), (p) => p.set({ full: on })).commit({ visibility: "sync" });
  return true;
}

/** 電話：台灣手機 09xxxxxxxx，或國際號碼 +xx…（8–15 碼） */
export function normPhone(v: unknown) {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/[\s\-()]/g, "");
  if (/^09\d{8}$/.test(t)) return t;
  if (/^\+?\d{8,15}$/.test(t)) return t.startsWith("+") ? t : `+${t}`;
  return undefined;
}

/** 前一天還沒入座的候位電話一併刪除，名單不留到隔天 */
async function purgeOldPhones(brand: BrandId) {
  const client = checkinClient();
  if (!client) return;
  const y = taipeiDate(new Date(Date.now() - 86_400_000));
  const id = dayId(brand, y);
  const keys = await client.fetch<string[] | null>(`*[_id == $id][0].waitlist[defined(phone)]._key`, { id });
  if (!keys?.length) return;
  await client.patch(id).unset(keys.map((k) => `waitlist[_key=="${k}"].phone`)).commit({ visibility: "async" });
}

export async function joinWait(brand: BrandId, input: { phone: string; size: number; lang: Lang }) {
  const client = checkinClient();
  if (!client) return undefined;
  const id = dayId(brand);
  const count = await client.fetch<number | null>(`count(*[_id == $id][0].waitlist)`, { id });
  const w: Wait = {
    _key: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    no: (count ?? 0) + 1,
    phone: input.phone,
    size: input.size,
    lang: input.lang,
    at: new Date().toISOString(),
    state: "waiting",
  };
  await client
    .transaction()
    .createIfNotExists(emptyDay(brand))
    .patch(id, (p) => p.setIfMissing({ waitlist: [] }).append("waitlist", [w]))
    .commit({ visibility: "sync" });
  purgeOldPhones(brand).catch(() => {});
  return w;
}

/** 客人自己查：我是幾號、前面還有幾組、輪到了沒 */
export async function waitInfo(brand: BrandId, key: string) {
  const client = checkinClient();
  if (!client || !/^[a-z0-9]{6,20}$/.test(key)) return undefined;
  const list = await client.fetch<Wait[] | null>(`*[_id == $id][0].waitlist[]{_key, no, size, at, state}`, { id: dayId(brand) });
  const me = list?.find((w) => w._key === key);
  if (!me) return null;
  const ahead = (list ?? []).filter((w) => w.state === "waiting" && w.at < me.at).length;
  return { no: me.no, size: me.size, state: me.state, ahead };
}

export async function listWait(brand: BrandId) {
  const client = checkinClient();
  if (!client) return undefined;
  return (await client.fetch<Wait[] | null>(`*[_id == $id][0].waitlist`, { id: dayId(brand) })) ?? [];
}

/** 改候位狀態；入座或取消時刪除電話 */
export async function markWait(brand: BrandId, key: string, state: WaitState) {
  const client = checkinClient();
  if (!client || !/^[a-z0-9]{6,20}$/.test(key)) return false;
  const base = `waitlist[_key=="${key}"]`;
  const now = new Date().toISOString();
  const p = client.patch(dayId(brand)).set({ [`${base}.state`]: state });
  if (state === "called") p.set({ [`${base}.calledAt`]: now });
  if (state === "waiting") p.unset([`${base}.calledAt`]);
  if (state === "seated" || state === "cancelled") p.set({ [`${base}.doneAt`]: now }).unset([`${base}.phone`]);
  await p.commit({ visibility: "sync" });
  return true;
}
