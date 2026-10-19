/**
 * 初始化：建立所有固定頁面的草稿（首頁、兩個品牌頁、兩份來店資訊、內容頁、列表頁設定、網站設定）。
 * 已發布或已有草稿的頁面一律略過，可重複執行。不會建立任何價格、時間、照片等正式資訊。
 * 執行：npm run setup:pages
 */
import { createClient } from "@sanity/client";
import { BRANDS, LISTING_PAGES, SINGLETON, brandDocId, shopDocId } from "../lib/constants";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-07-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const zh = (s: string) => ({ zh: s });

const docs: { _id: string; _type: string; [k: string]: unknown }[] = [
  { _id: SINGLETON.settings, _type: "siteSettings", siteName: "FUFU × NUKUNUKU" },
  { _id: SINGLETON.home, _type: "homePage", headline: zh("FUFU × NUKUNUKU") },
  ...BRANDS.flatMap((b) => [
    { _id: brandDocId(b.id), _type: "brand", brand: b.id, headline: zh(b.official) },
    { _id: shopDocId(b.id), _type: "shopInfo", brand: b.id, noReservation: true, verified: false },
  ]),
  { _id: SINGLETON.about, _type: "contentPage", title: zh("品牌理念") },
  { _id: SINGLETON.privacy, _type: "contentPage", title: zh("隱私權政策") },
  { _id: SINGLETON.firstVisit, _type: "firstVisitGuide", title: zh("第一次來店指南") },
  { _id: SINGLETON.adoption, _type: "adoptionGuide", title: zh("中途貓認養") },
  ...LISTING_PAGES.map((p) => ({ _id: p.id, _type: "listingPage", title: zh(p.title) })),
];

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("請在 .env.local 設定 SANITY_API_WRITE_TOKEN");
  const ids = docs.flatMap((d) => [d._id, `drafts.${d._id}`]);
  const existing = new Set(await client.fetch<string[]>(`*[_id in $ids]._id`, { ids }, { perspective: "raw" }));
  const tx = client.transaction();
  let n = 0;
  for (const d of docs) {
    if (existing.has(d._id) || existing.has(`drafts.${d._id}`)) continue;
    tx.create({ ...d, _id: `drafts.${d._id}` });
    n++;
  }
  if (n) await tx.commit();
  console.log(`✓ 建立 ${n} 份固定頁面草稿（${docs.length - n} 份已存在略過）。請到 /studio 填寫內容後按「發布」。`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
