import { stegaClean } from "next-sanity";
import "server-only";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/sanity/env";
import { ogImageUrl, urlFor, type SanityImageSource } from "@/sanity/lib/image";
import { SEO_DEFAULTS_QUERY } from "@/sanity/lib/queries";
import { BRANDS, DAYS, PAYMENTS, type BrandId } from "./constants";
import { load } from "./data";
import { groupHours } from "./hours";
import { HREFLANG, OG_LOCALE, localePrefix } from "./locale";
import type { FaqItem, Shop } from "./types";

/** 某語言版本的完整網址 */
export function absUrl(locale: Locale, path: string) {
  const prefix = localePrefix(locale);
  const p = path === "/" ? (prefix ? "" : "/") : path;
  return new URL(`${prefix}${p}`, siteUrl).toString();
}

type PageMeta = {
  locale: Locale;
  /** 不含語言前綴的路徑，例如 /fufu/cats/mochi */
  path: string;
  title?: string | null;
  description?: string | null;
  image?: unknown;
  noIndex?: boolean;
  /** 主要內容尚未翻成目前語言：不收錄，避免與中文頁重複 */
  untranslated?: boolean;
  type?: "website" | "article";
};

/** 每頁的 Metadata：標題、描述、canonical、四語 hreflang、分享圖 */
export async function pageMetadata(o: PageMeta): Promise<Metadata> {
  const [d, t] = await Promise.all([
    load<{ siteName?: string; title?: string; description?: string; image?: unknown } | null>(SEO_DEFAULTS_QUERY, o.locale, {}, { stega: false }),
    getTranslations({ locale: o.locale, namespace: "site" }),
  ]);
  const siteName = d?.siteName || t("name");
  const sep = o.locale === "zh-Hant" || o.locale === "ja" ? "｜" : " | ";
  const title = o.title ? `${o.title}${sep}${siteName}` : d?.title || siteName;
  const description = o.description || d?.description || t("description");
  const image = ogImageUrl((o.image ?? d?.image) as SanityImageSource | undefined);

  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [HREFLANG[l], absUrl(l, o.path)]));
  languages["x-default"] = absUrl(routing.defaultLocale, o.path);

  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: title },
    description,
    alternates: { canonical: absUrl(o.locale, o.path), languages },
    robots: o.noIndex || o.untranslated ? { index: false, follow: true } : undefined,
    openGraph: {
      type: o.type ?? "website",
      siteName,
      title,
      description,
      url: absUrl(o.locale, o.path),
      locale: OG_LOCALE[o.locale],
      alternateLocale: routing.locales.filter((l) => l !== o.locale).map((l) => OG_LOCALE[l]),
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

/* ───────── 結構化資料（JSON-LD） ───────── */

const imgUrl = (img: unknown, w = 1200) => (img && (img as { asset?: unknown }).asset ? urlFor(img as SanityImageSource).width(w).url() : undefined);

export function organizationLd(siteName: string, socials?: { url: string }[] | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    url: siteUrl,
    logo: new URL(BRANDS[0].logo, siteUrl).toString(),
    sameAs: (socials ?? []).map((s) => s.url),
    brand: BRANDS.map((b) => ({ "@type": "Brand", name: b.official, logo: new URL(b.logo, siteUrl).toString() })),
  };
}

export function websiteLd(siteName: string, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: absUrl(locale, "/"),
    inLanguage: HREFLANG[locale],
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

/** 店家：地址、營業時間、價格、付款方式 */
export function shopLd(shopIn: Shop, locale: Locale, image?: unknown) {
  const shop = { ...shopIn, brand: stegaClean(shopIn.brand) };
  const b = BRANDS.find((x) => x.id === shop.brand);
  if (!b) return null;
  const prices = (shop.prices ?? []).flatMap((p) => [p.weekday, p.holiday]).filter((n): n is number => typeof n === "number");
  const schemaDay = (d: string) => `https://schema.org/${DAYS.find((x) => x.value === d)!.schema}`;
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${siteUrl}/${shop.brand}#shop`,
    name: b.official,
    alternateName: b.name,
    url: absUrl(locale, `/${shop.brand}`),
    image: imgUrl(image) ?? new URL(b.logo, siteUrl).toString(),
    logo: new URL(b.logo, siteUrl).toString(),
    telephone: shop.phone || undefined,
    address: shop.address
      ? { "@type": "PostalAddress", streetAddress: shop.address, addressLocality: shop.city, postalCode: shop.postalCode, addressCountry: "TW" }
      : undefined,
    geo: shop.location ? { "@type": "GeoCoordinates", latitude: shop.location.lat, longitude: shop.location.lng } : undefined,
    hasMap: shop.mapUrl || undefined,
    openingHoursSpecification: groupHours(shop.hours)
      .filter((g) => !g.closed && g.open && g.close)
      .map((g) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.days.map(schemaDay), opens: g.open, closes: g.close })),
    specialOpeningHoursSpecification: (shop.specialDates ?? []).map((s) => ({
      "@type": "OpeningHoursSpecification",
      validFrom: s.date,
      validThrough: s.date,
      opens: s.closed ? "00:00" : s.open,
      closes: s.closed ? "00:00" : s.close,
    })),
    priceRange: prices.length
      ? Math.min(...prices) === Math.max(...prices)
        ? `NT$${Math.min(...prices)}`
        : `NT$${Math.min(...prices)}–${Math.max(...prices)}`
      : undefined,
    currenciesAccepted: "TWD",
    paymentAccepted: (shop.payments ?? []).map((p) => PAYMENTS.find((x) => x.value === p)?.title ?? p).join(", ") || undefined,
    sameAs: [shop.mapUrl, ...(b.socials ?? []).map((x) => x.url)].filter(Boolean),
    parentOrganization: { "@id": `${siteUrl}/#organization` },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqLd(faqs: FaqItem[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function articleLd(o: { type: "NewsArticle" | "Article"; title: string; url: string; image?: unknown; published: string; modified?: string; description?: string | null; locale: Locale }) {
  return {
    "@context": "https://schema.org",
    "@type": o.type,
    headline: o.title,
    description: o.description || undefined,
    image: imgUrl(o.image),
    datePublished: o.published,
    dateModified: o.modified ?? o.published,
    inLanguage: HREFLANG[o.locale],
    mainEntityOfPage: o.url,
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function eventLd(o: { title: string; url: string; start: string; end?: string | null; image?: unknown; description?: string | null; shops: Shop[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: o.title,
    url: o.url,
    startDate: o.start,
    endDate: o.end || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: imgUrl(o.image),
    description: o.description || undefined,
    location: o.shops.map((s) => ({
      "@type": "Place",
      name: BRANDS.find((b) => b.id === s.brand)!.official,
      address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressCountry: "TW" },
    })),
    organizer: { "@id": `${siteUrl}/#organization` },
  };
}

export function gameLd(o: { title: string; url: string; playUrl?: string | null; image?: unknown; description?: string | null; platforms?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: o.title,
    url: o.playUrl || o.url,
    image: imgUrl(o.image),
    description: o.description || undefined,
    gamePlatform: o.platforms,
    applicationCategory: "Game",
    author: { "@id": `${siteUrl}/#organization` },
  };
}

export function catLd(o: { name: string; url: string; image?: unknown; description?: string | null; brand: BrandId; locale: Locale }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: o.name,
    url: o.url,
    description: o.description || undefined,
    inLanguage: HREFLANG[o.locale],
    primaryImageOfPage: imgUrl(o.image) ? { "@type": "ImageObject", contentUrl: imgUrl(o.image), caption: o.name } : undefined,
    about: { "@id": `${siteUrl}/${o.brand}#shop` },
  };
}
