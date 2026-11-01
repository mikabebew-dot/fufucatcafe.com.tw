import { BRANDS } from "./constants";

type ShopLike = { brand: string; addressZh?: string; address?: string; location?: { lat: number; lng: number } | null; lineUrl?: string; phone?: string };

/** 導航：用 Google 地圖規劃路線（手機會自動開啟地圖 App） */
export function directionsUrl(shop: ShopLike | undefined) {
  if (!shop) return undefined;
  const dest = shop.location ? `${shop.location.lat},${shop.location.lng}` : shop.addressZh || shop.address;
  if (!dest) return undefined;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

/** LINE 官方帳號：後台有填就用後台的，沒填用預設帳號 */
export function lineUrl(shop: ShopLike | undefined, brand: string) {
  if (shop?.lineUrl) return shop.lineUrl;
  const id = BRANDS.find((b) => b.id === brand)?.line;
  return id ? `https://line.me/R/ti/p/${encodeURIComponent(id)}` : undefined;
}

export function telUrl(phone?: string) {
  return phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : undefined;
}
