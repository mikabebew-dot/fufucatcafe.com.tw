import { Cinzel, Jost, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VisualEditing } from "next-sanity/visual-editing";
import type { ReactNode } from "react";
import { DraftModeBar } from "@/components/DraftModeBar";
import { JsonLd } from "@/components/JsonLd";
import { Announcement } from "@/components/site/Announcement";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { routing } from "@/i18n/routing";
import { load } from "@/lib/data";
import { HREFLANG } from "@/lib/locale";
import { organizationLd, websiteLd } from "@/lib/seo";
import { SanityLive } from "@/sanity/lib/live";
import { LAYOUT_QUERY } from "@/sanity/lib/queries";
import "../globals.css";

// 字型由 Next.js 在建置時下載並自行託管，訪客不需連到 Google
const sans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-noto-sans", display: "swap", preload: false });
const serif = Noto_Serif_TC({ weight: ["600"], variable: "--font-noto-serif", display: "swap", preload: false });
const cinzel = Cinzel({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const jost = Jost({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-jost", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutData = {
  settings: {
    siteName?: string;
    announcement?: { enabled?: boolean; until?: string; link?: string; text?: string } | null;
    socials?: { platform: string; url: string }[];
    footerLinks?: { _key: string; category: "store" | "partner"; url: string; name: string }[];
  } | null;
  shops: { brand: string; address?: string; phone?: string; mapUrl?: string }[];
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [{ isEnabled: isDraft }, data, t] = await Promise.all([
    draftMode(),
    load<LayoutData>(LAYOUT_QUERY, locale, {}, { stega: false }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const s = data?.settings;
  const siteName = s?.siteName || "FUFU × NUKUNUKU";

  return (
    <html lang={HREFLANG[locale]} className={`${sans.variable} ${serif.variable} ${cinzel.variable} ${jost.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">{t("skip")}</a>
          {s?.announcement?.enabled && <Announcement text={s.announcement.text} link={s.announcement.link} until={s.announcement.until} />}
          <SiteHeader siteName={siteName} />
          <main id="main">{children}</main>
          <SiteFooter data={{ siteName, shops: data?.shops ?? [], socials: s?.socials ?? [], footerLinks: s?.footerLinks ?? [] }} />
          <JsonLd data={[organizationLd(siteName, s?.socials), websiteLd(siteName, locale)]} />
          {/* 內容發布後自動更新頁面，不需重新部署 */}
          <SanityLive />
          {isDraft && (
            <>
              <DraftModeBar />
              <VisualEditing />
            </>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
