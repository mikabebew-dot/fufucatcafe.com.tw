"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ADOPTION_BRAND, brandOf, type BrandId } from "@/lib/constants";

/** 品牌頁內導覽：進入品牌後只在自己的分頁間移動 */
export function BrandNav({ brand }: { brand: BrandId }) {
  const t = useTranslations();
  const pathname = usePathname();
  const b = brandOf(brand);
  const tabs = [
    { href: `/${brand}`, label: t("brand.tabIntro"), exact: true },
    { href: `/${brand}/cats`, label: t("brand.tabCats") },
    ...(brand === ADOPTION_BRAND ? [{ href: `/${brand}/adoption`, label: t("brand.tabAdoption") }] : []),
    { href: `/${brand}/visit`, label: t("brand.tabVisit") },
  ];
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) || (href.endsWith("/adoption") && pathname.startsWith(`/${brand}/graduates`));
  return (
    <nav className="brand-nav" aria-label={t("nav.brandNav", { brand: b.name })}>
      <div className="wrap">
        <Link href={`/${brand}`} aria-label={b.official} style={{ marginRight: "auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.logo} alt={b.official} width={44} height={44} />
        </Link>
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="tab" aria-current={active(tab.href, tab.exact) ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
