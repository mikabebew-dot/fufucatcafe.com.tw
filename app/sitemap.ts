import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { CONTENT_KEY, HREFLANG } from "@/lib/locale";
import { absUrl } from "@/lib/seo";
import { client } from "@/sanity/lib/client";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

export const revalidate = 3600;

const STATIC_PATHS = [
  "/", "/fufu", "/nukunuku", "/fufu/cats", "/nukunuku/cats", "/fufu/visit", "/nukunuku/visit",
  "/nukunuku/adoption", "/nukunuku/graduates", "/visit", "/first-visit", "/about", "/cats", "/news", "/faq", "/playroom", "/privacy",
];

type Entry = { slug: string; brand?: string; _updatedAt: string; langs: (string | null)[] };

/** 每個網址列出所有語言版本（hreflang）；內容沒翻譯的語言不列入 */
function entries(path: string, locales: readonly Locale[], lastModified?: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [HREFLANG[l], absUrl(l, path)]));
  return locales.map((l) => ({ url: absUrl(l, path), lastModified, alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data: { cats: Entry[]; news: Entry[]; games: Entry[]; stories: Entry[] } = await client.fetch(SITEMAP_QUERY, {}, { stega: false });
  const translated = (e: Entry) => routing.locales.filter((l) => e.langs.includes(CONTENT_KEY[l]));
  return [
    ...STATIC_PATHS.flatMap((p) => entries(p, routing.locales)),
    ...data.cats.flatMap((c) => entries(`/${c.brand}/cats/${c.slug}`, translated(c), c._updatedAt)),
    ...data.news.flatMap((n) => entries(`/news/${n.slug}`, translated(n), n._updatedAt)),
    ...data.games.flatMap((g) => entries(`/playroom/${g.slug}`, translated(g), g._updatedAt)),
    ...data.stories.flatMap((s) => entries(`/nukunuku/graduates/${s.slug}`, translated(s), s._updatedAt)),
  ];
}
