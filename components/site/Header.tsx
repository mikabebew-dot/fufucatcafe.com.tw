"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { BRANDS } from "@/lib/constants";
import { LangSwitcher } from "./LangSwitcher";

const NAV = [
  { href: "/fufu", key: "fufu" },
  { href: "/nukunuku", key: "nukunuku" },
  { href: "/first-visit", key: "firstVisit" },
  { href: "/visit", key: "visit" },
  { href: "/cats", key: "cats" },
  { href: "/nukunuku/adoption", key: "adoption" },
  { href: "/news", key: "news" },
  { href: "/faq", key: "faq" },
  { href: "/playroom", key: "playroom" },
] as const;

export function SiteHeader({ siteName }: { siteName: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const current = (href: string) =>
    (href === "/nukunuku" ? pathname === href || (pathname.startsWith("/nukunuku/") && !pathname.startsWith("/nukunuku/adoption")) : pathname.startsWith(href))
      ? "page"
      : undefined;

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="lockup" aria-label={siteName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRANDS[0].logo} alt="" width={32} height={32} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRANDS[1].logo} alt="" width={32} height={32} />
          <span>{siteName}</span>
        </Link>
        <nav className="desktop-nav" aria-label={t("main")}>
          {NAV.filter((n) => n.key !== "visit").map((n) => (
            <Link key={n.href} href={n.href} aria-current={current(n.href)}>
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/visit" className="btn visit-btn">
            {t("visit")}
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="site-drawer"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M2 5h14M2 9h14M2 13h14" />}
            </svg>
          </button>
        </div>
      </div>
      <div id="site-drawer" className="drawer" hidden={!open}>
        <div className="wrap">
          <nav aria-label={t("main")}>
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>{t("home")}</Link>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={current(n.href)}>
                {t(n.key)}
              </Link>
            ))}
            <Link href="/about" aria-current={current("/about")}>{t("about")}</Link>
          </nav>
          <LangSwitcher />
        </div>
      </div>
    </header>
  );
}
