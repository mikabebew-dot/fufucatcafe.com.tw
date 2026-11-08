"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Google Ads 代碼（AW-826827438）＋ 點擊轉換追蹤
 *
 * 網站上所有連到 LINE、Google 地圖導航、電話的連結，
 * 只要有人點擊，就會自動送一筆事件給 Google Ads，並依網址判斷是哪一家店。
 * 新增按鈕時不需要改這裡：只要連結網址是 line.me / google.com/maps / tel: 就會被追蹤。
 *
 * 轉換標籤（CONVERSION_LABELS）在 Google Ads「目標 > 轉換」建立轉換動作後取得，
 * 留空的項目只會送一般事件，不會計入轉換。
 */
export const GOOGLE_ADS_ID = "AW-826827438";

type Brand = "fufu" | "nukunuku";
type Action = "line" | "directions" | "call";

// LINE 官方帳號 ID → 店家
const LINE_IDS: Record<string, Brand> = {
  qvy2066j: "fufu",
  "808gupte": "nukunuku",
};

// 兩家店的座標（導航連結裡的 destination），用來判斷是哪一家店
const SHOP_COORDS: { brand: Brand; lat: number; lng: number }[] = [
  { brand: "fufu", lat: 25.044727, lng: 121.5073297 },
  { brand: "nukunuku", lat: 25.0450855, lng: 121.5080542 },
];

// 在 Google Ads 建立轉換動作後，把「轉換標籤」填在這裡（格式：AW-826827438/xxxxxxxx 的斜線後半段）
const CONVERSION_LABELS: Partial<Record<`${Action}_${Brand}`, string>> = {};

function brandFromLine(href: string): Brand | undefined {
  const decoded = decodeURIComponent(href).toLowerCase();
  for (const [id, brand] of Object.entries(LINE_IDS)) {
    if (decoded.includes(id)) return brand;
  }
  return undefined;
}

function brandFromMap(href: string): Brand | undefined {
  try {
    const url = new URL(href);
    const dest = url.searchParams.get("destination") || url.searchParams.get("query") || "";
    const [lat, lng] = dest.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      let best: Brand | undefined;
      let bestDist = Infinity;
      for (const s of SHOP_COORDS) {
        const d = (s.lat - lat) ** 2 + (s.lng - lng) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = s.brand;
        }
      }
      return best;
    }
  } catch {
    /* 不是標準網址，略過 */
  }
  const text = decodeURIComponent(href);
  if (/武昌街/.test(text) || /fufu/i.test(text)) return "fufu";
  if (/漢口街/.test(text) || /nuku/i.test(text)) return "nukunuku";
  return undefined;
}

function classify(href: string): { action: Action; brand?: Brand } | null {
  if (/^https?:\/\/(line\.me|lin\.ee|page\.line\.me)\//i.test(href)) return { action: "line", brand: brandFromLine(href) };
  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps|^https?:\/\/maps\.(google|app\.goo)\.|^https?:\/\/goo\.gl\/maps/i.test(href)) {
    return { action: "directions", brand: brandFromMap(href) };
  }
  if (/^tel:/i.test(href)) return { action: "call" };
  return null;
}

type GtagFn = (...args: unknown[]) => void;

export function GoogleAdsTag() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const hit = classify(a.href);
      if (!hit) return;
      const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
      if (typeof gtag !== "function") return;

      const brand = hit.brand ?? "unknown";
      gtag("event", `${hit.action}_click`, { brand, link_url: a.href, page_path: location.pathname });

      const label = hit.brand ? CONVERSION_LABELS[`${hit.action}_${hit.brand}`] : undefined;
      if (label) gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}` });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-ads-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
