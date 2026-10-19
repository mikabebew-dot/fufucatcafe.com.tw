import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb, NewsMeta, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { routing, type Locale } from "@/i18n/routing";
import { load } from "@/lib/data";
import { absUrl, articleLd, eventLd, pageMetadata } from "@/lib/seo";
import type { Img, Seo, Shop } from "@/lib/types";
import { client } from "@/sanity/lib/client";
import { NEWS_QUERY, NEWS_SLUGS_QUERY, SHOPS_QUERY } from "@/sanity/lib/queries";

type NewsDoc = {
  _id: string;
  publishedAt: string;
  _updatedAt: string;
  category?: string;
  brand?: string;
  eventStart?: string | null;
  eventEnd?: string | null;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: unknown;
  translated?: boolean;
  cover?: Img;
  seo?: Seo;
};
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(NEWS_SLUGS_QUERY, {}, { stega: false });
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const n = await load<NewsDoc | null>(NEWS_QUERY, locale, { slug }, { stega: false });
  if (!n) return {};
  return pageMetadata({
    locale,
    path: `/news/${slug}`,
    title: n.seo?.title || n.title,
    description: n.seo?.description || n.excerpt,
    image: n.seo?.image ?? n.cover,
    noIndex: n.seo?.noIndex,
    untranslated: n.translated === false,
    type: "article",
  });
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const [n, t, format] = await Promise.all([load<NewsDoc | null>(NEWS_QUERY, locale, { slug }), getTranslations("news"), getFormatter()]);
  // 已下架（取消發布）的消息訪客讀不到 → 404
  if (!n) notFound();
  const url = absUrl(locale, `/news/${slug}`);
  const shops = n.eventStart ? ((await load<{ shops: Shop[] }>(SHOPS_QUERY, locale, {}, { stega: false }))?.shops ?? []) : [];
  const eventShops = shops.filter((s) => n.brand === "both" || !n.brand || s.brand === n.brand);
  const fmt = (d: string) => format.dateTime(new Date(d), { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <article className="wrap narrow">
      <Breadcrumb href="/news" label={t("title")} />
      <Untranslated show={n.translated === false} />
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <NewsMeta item={n} />
        <h1 style={{ marginTop: 10 }}>{n.title}</h1>
      </header>
      {n.eventStart && (
        <p className="notice event-box">
          <b style={{ fontWeight: 500 }}>{t("eventDate")}</b>　{fmt(n.eventStart)}{n.eventEnd ? ` – ${fmt(n.eventEnd)}` : ""}
        </p>
      )}
      {n.cover?.asset && <div className="article-cover"><SanityImage image={n.cover} fill sizes="(max-width: 760px) 100vw, 760px" priority /></div>}
      <RichText value={n.body} />
      <JsonLd
        data={[
          articleLd({ type: "NewsArticle", title: n.title, url, image: n.cover, published: n.publishedAt, modified: n._updatedAt, description: n.excerpt, locale }),
          n.eventStart ? eventLd({ title: n.title, url, start: n.eventStart, end: n.eventEnd, image: n.cover, description: n.excerpt, shops: eventShops }) : null,
        ]}
      />
    </article>
  );
}
