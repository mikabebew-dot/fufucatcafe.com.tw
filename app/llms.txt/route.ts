/**
 * /llms.txt：給 AI 搜尋與問答引擎讀的店家事實摘要（GEO / AEO）。
 * 內容全部來自後台已發布、已核對的資料；資料更新後一小時內自動重建。
 */
import { BRANDS, DAYS, PAYMENTS } from "@/lib/constants";
import { todayTaipei } from "@/lib/data";
import { groupHours } from "@/lib/hours";
import type { FaqItem, Shop } from "@/lib/types";
import { siteUrl } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { LLMS_QUERY } from "@/sanity/lib/queries";

export const revalidate = 3600;

type Data = {
  shops: Shop[];
  brands: { brand: string; headline?: string; tagline?: string }[];
  faqs: FaqItem[];
  catCount: Record<string, number>;
  waiting: number;
  adoptionApply?: string;
};

const u = (p: string) => new URL(p, siteUrl).toString();
const day = (d: string) => DAYS.find((x) => x.value === d)?.schema.slice(0, 3) ?? d;

function shopBlock(shop: Shop | undefined, brand: (typeof BRANDS)[number], d: Data) {
  const lines = [`## ${brand.official}（${brand.name}）`];
  const info = d.brands.find((b) => b.brand === brand.id);
  if (info?.tagline || info?.headline) lines.push(info.tagline || info.headline || "");
  lines.push(`- 官網 Website: ${u(`/${brand.id}`)}`);
  if (!shop) {
    lines.push("- 營業資訊確認中 Visit information is being confirmed.");
    return lines.join("\n");
  }
  if (shop.address) lines.push(`- 地址 Address: ${shop.address}`);
  if (shop.phone) lines.push(`- 電話 Phone: ${shop.phone}`);
  const hours = groupHours(shop.hours)
    .map((g) => `${g.days.map(day).join("/")} ${g.closed ? "closed" : `${g.open}-${g.close}`}`)
    .join("; ");
  if (hours) lines.push(`- 營業時間 Hours (Asia/Taipei): ${hours}`);
  for (const s of shop.specialDates ?? []) lines.push(`- 特別營業日 Special: ${s.date} ${s.closed ? "closed" : `${s.open}-${s.close}`}${s.note ? ` (${s.note})` : ""}`);
  for (const p of shop.prices ?? []) lines.push(`- 價格 Price: ${p.name} — weekday NT$${p.weekday ?? "?"}, weekend/holiday NT$${p.holiday ?? "?"}${p.note ? ` (${p.note})` : ""}`);
  if (shop.priceNote) lines.push(`- 價格說明: ${shop.priceNote.replace(/\n/g, " ")}`);
  if (shop.payments?.length) lines.push(`- 付款 Payment: ${shop.payments.map((p) => PAYMENTS.find((x) => x.value === p)?.title ?? p).join(", ")}`);
  lines.push(`- 入場 Entry: ${shop.entryAge ? `age ${shop.entryAge}+` : "all ages"}${shop.noReservation !== false ? ", no reservation needed" : ""}${shop.entryNote ? ` (${shop.entryNote})` : ""}`);
  if (shop.mrt) lines.push(`- 交通 Access: ${shop.mrt.replace(/\n/g, " ")}`);
  if (shop.mapUrl) lines.push(`- 地圖 Map: ${shop.mapUrl}`);
  lines.push(`- 貓咪 Cats: ${d.catCount[brand.id] ?? 0} — ${u(`/${brand.id}/cats`)}`);
  if (shop.verifiedAt) lines.push(`- 資訊核對日期 Verified: ${shop.verifiedAt.slice(0, 10)}`);
  return lines.join("\n");
}

export async function GET() {
  const d: Data = await client.fetch(LLMS_QUERY, { lang: "zh", today: todayTaipei() }, { stega: false });
  const body = [
    "# FUFU × NUKUNUKU",
    "",
    "> 台灣的兩間貓咪咖啡廳。FU FU CAT CAFE（since 2017）與 NUKU NUKU CAT CAFE；NUKUNUKU 是中途貓咖啡，店內貓咪可認養。",
    "> Two cat cafés in Taiwan. NUKU NUKU CAT CAFE is a foster-cat café where the cats can be adopted.",
    "",
    ...BRANDS.map((b) => shopBlock(d.shops.find((s) => s.brand === b.id), b, d) + "\n"),
    "## 認養 Adoption（NUKUNUKU only）",
    `- 目前等家的貓 Cats waiting for a home: ${d.waiting}`,
    `- 認養說明 How to adopt: ${u("/nukunuku/adoption")}`,
    d.adoptionApply ? `- 申請表 Application: ${d.adoptionApply}` : "",
    `- 畢業故事 Graduate stories: ${u("/nukunuku/graduates")}`,
    "",
    "## 主要頁面 Key pages",
    `- 價格・時間・交通 Prices, hours & access: ${u("/visit")}`,
    `- 第一次來店 First visit guide: ${u("/first-visit")}`,
    `- 常見問題 FAQ: ${u("/faq")}`,
    `- 最新消息 News: ${u("/news")}`,
    `- Languages: 繁中 ${u("/")} · English ${u("/en")} · 日本語 ${u("/ja")} · 한국어 ${u("/ko")}`,
    "",
    "## 常見問題 FAQ",
    ...d.faqs.slice(0, 30).map((f) => `- Q: ${f.question}\n  A: ${f.answer.replace(/\n/g, " ")}`),
    "",
  ]
    .filter((l) => l !== "")
    .join("\n");
  return new Response(body.replace(/\n(## )/g, "\n\n$1"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
