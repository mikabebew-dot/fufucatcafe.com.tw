/**
 * 給 Canva「從網址匯入」用的純 HTML 版 QR 卡（不含程式碼，單一頁面，固定 600×900）。
 * 匯入後在 Canva 裡可以改字、換圖、調排版再列印。
 */
import QRCode from "qrcode";
import { brandOf, isBrand } from "@/lib/constants";
import { siteUrl } from "@/sanity/env";

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ brand: "fufu" }, { brand: "nukunuku" }];
}

const COLORS = {
  fufu: { ground: "#f5f8f7", soft: "#e2efec", ink: "#4a4747", muted: "#6b6767", accent: "#4f7a72" },
  nukunuku: { ground: "#fdf5ee", soft: "#f9d1b7", ink: "#3b2a22", muted: "#7a6258", accent: "#a75337" },
} as const;

export async function GET(_req: Request, { params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) return new Response("Not found", { status: 404 });
  const b = brandOf(brand);
  const c = COLORS[brand];
  const origin = siteUrl.includes("localhost") ? "https://fufucatcafe.com.tw" : siteUrl.replace(/\/$/, "");
  const url = `${origin}/checkin/${brand}/cats`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2b2523", light: "#ffffff" } });
  const fufu = brand === "fufu";
  const title = fufu ? "姊妹店 NUKUNUKU<br>等家的孩子" : "今天在店裡<br>等家的孩子";
  const en = fufu ? "Meet the cats waiting for a home at NUKUNUKU" : "Meet the cats waiting for a home";
  const foot = fufu ? "走路 3 分鐘就到・掃描認識牠們" : "掃描認識牠們・想多了解歡迎問店員";

  const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<title>${b.name}｜等家的孩子 QR 卡</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap">
<style>
  body { margin: 0; background: #fff; font-family: "Noto Sans TC", sans-serif; }
  .page { width: 600px; height: 900px; box-sizing: border-box; padding: 56px 48px; background: ${c.ground}; color: ${c.ink};
    display: flex; flex-direction: column; align-items: center; text-align: center; }
  .logo { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; }
  h1 { font-size: 46px; line-height: 1.35; margin: 28px 0 10px; font-weight: 700; color: ${c.ink}; }
  .en { font-size: 18px; color: ${c.muted}; margin: 0; }
  .langs { font-size: 18px; color: ${c.muted}; margin: 4px 0 0; }
  .qr { width: 300px; height: 300px; margin: 32px 0 26px; padding: 18px; background: #fff; border-radius: 24px; border: 4px solid ${c.accent}; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .foot { font-size: 22px; font-weight: 700; color: ${c.accent}; margin: 0; }
  .url { font-size: 14px; color: ${c.muted}; margin: 12px 0 0; }
</style>
</head>
<body>
<div class="page" data-document-role="page" data-label="${b.name} 等家的孩子 QR 卡">
  <img class="logo" src="${origin}${b.logo}" alt="${b.name}">
  <h1>${title}</h1>
  <p class="en">${en}</p>
  <p class="langs">おうちを待つ猫たち・가족을 기다리는 아이들</p>
  <div class="qr">${qr}</div>
  <p class="foot">${foot}</p>
  <p class="url">${url.replace("https://", "")}</p>
</div>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
