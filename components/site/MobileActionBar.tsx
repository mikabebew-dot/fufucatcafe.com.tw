"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BRANDS } from "@/lib/constants";
import { directionsUrl, lineUrl, telUrl } from "@/lib/contact";

type ShopLite = { brand: string; address?: string; addressZh?: string; location?: { lat: number; lng: number } | null; lineUrl?: string; phone?: string };

/** 手機版底部固定按鈕：品牌頁顯示該店的 LINE／導航／電話；其他頁顯示兩店 LINE 與價格交通 */
export function MobileActionBar({ shops }: { shops: ShopLite[] }) {
  const t = useTranslations();
  const pathname = usePathname();
  const brand = BRANDS.find((b) => pathname === `/${b.id}` || pathname.startsWith(`/${b.id}/`))?.id;

  if (brand) {
    const shop = shops.find((s) => s.brand === brand);
    const line = lineUrl(shop, brand);
    const nav = directionsUrl(shop);
    const tel = telUrl(shop?.phone);
    return (
      <nav className={`action-bar ${brand}`} aria-label={t("common.line")}>
        {line && <a className="primary" href={line} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span>{t("common.line")}</a>}
        {nav && <a href={nav} target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📍</span>{t("common.directions")}</a>}
        {tel && <a href={tel}><span aria-hidden="true">📞</span>{t("common.call")}</a>}
      </nav>
    );
  }

  return (
    <nav className="action-bar" aria-label={t("common.line")}>
      {BRANDS.map((b) => {
        const line = lineUrl(shops.find((s) => s.brand === b.id), b.id);
        return line ? (
          <a key={b.id} className={`primary ${b.id}`} href={line} target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">💬</span>{b.name}
          </a>
        ) : null;
      })}
      <Link href="/visit"><span aria-hidden="true">📍</span>{t("nav.visit")}</Link>
    </nav>
  );
}
