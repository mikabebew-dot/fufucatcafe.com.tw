"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LOCALE_LABEL } from "@/lib/locale";

export function LangSwitcher() {
  const pathname = usePathname();
  const current = useLocale();
  const t = useTranslations("footer");
  return (
    <nav className="lang" aria-label={t("language")}>
      {routing.locales.map((l) => (
        <Link key={l} href={pathname} locale={l} aria-current={l === current ? "true" : undefined} hrefLang={l} lang={l}>
          <span>{LOCALE_LABEL[l]}</span>
        </Link>
      ))}
    </nav>
  );
}
