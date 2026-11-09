/**
 * 給 Canva「從網址匯入」用的純 HTML 版入場 QR 立牌（不含程式碼，單一頁面，固定 600×900）。
 * 匯入後在 Canva 裡可以改字、換圖、調排版再列印。
 */
import QRCode from "qrcode";
import { checkinLogo } from "@/lib/checkin/content";
import { brandOf, isBrand } from "@/lib/constants";
import { siteUrl } from "@/sanity/env";

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ brand: "fufu" }, { brand: "nukunuku" }];
}

const COLORS = {
  fufu: { ground: "#eef2ee", soft: "#ead9c4", ink: "#33302c", muted: "#5f665f", accent: "#4f7a72" },
  nukunuku: { ground: "#fdf5ee", soft: "#f9d1b7", ink: "#3b2a22", muted: "#7a6258", accent: "#a75337" },
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) return new Response("Not found", { status: 404 });
  const b = brandOf(brand);
  const c = COLORS[brand];
  const origin = siteUrl.includes("localhost") ? "https://fufucatcafe.com.tw" : siteUrl.replace(/\/$/, "");
  const url = `${origin}/checkin/${brand}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2b2523", light: "#ffffff" } });
  const title = `入場前<br>請掃描確認`;
  const en = "Please scan before you enter";
  const langs = "入店前にスキャンしてください・입장 전에 스캔해 주세요";
  const foot = "費用・飲品方案・和貓咪的約定";

  const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<title>${b.name}｜入場 QR 立牌</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&family=Noto+Sans+KR:wght@400&family=Noto+Sans+JP:wght@400&display=swap">
<style>
  body { margin: 0; background: #fff; font-family: "Noto Sans TC", "Noto Sans JP", "Noto Sans KR", sans-serif; }
  .langs { font-family: "Noto Sans KR", "Noto Sans JP", "Noto Sans TC", sans-serif; }
  .page { width: 600px; height: 900px; box-sizing: border-box; padding: 56px 48px; background: ${c.ground}; color: ${c.ink};
    display: flex; flex-direction: column; align-items: center; text-align: center; }
  .logo { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; }
  h1 { font-size: 46px; line-height: 1.35; margin: 8px 0 10px; font-weight: 700; color: ${c.ink}; }
  .brand { font-size: 20px; font-weight: 700; letter-spacing: .08em; color: ${c.accent}; margin: 20px 0 0; }
  .en { font-size: 18px; color: ${c.muted}; margin: 0; }
  .langs { font-size: 18px; color: ${c.muted}; margin: 4px 0 0; }
  .qr { width: 300px; height: 300px; margin: 32px 0 26px; padding: 18px; background: #fff; border-radius: 24px; border: 4px solid ${c.accent}; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .foot { font-size: 22px; font-weight: 700; color: ${c.accent}; margin: 0; }
  .url { font-size: 14px; color: ${c.muted}; margin: 12px 0 0; }
</style>
</head>
<body>
<div class="page" data-document-role="page" data-label="${b.name} 入場 QR 立牌">
  <img class="logo" src="${origin}${checkinLogo(brand, b.logo)}" alt="${b.name}">
  <p class="brand">${b.name} CAT CAFE</p>
  <h1>${title}</h1>
  <p class="en">${en}</p>
  <p class="langs">${langs}</p>
  <div class="qr">${qr}</div>
  <p class="foot">${foot}</p>
  <p class="url">${url.replace("https://", "")}</p>
</div>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
