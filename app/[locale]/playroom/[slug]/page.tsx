import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb, CatCard, SectionHead, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { routing, type Locale } from "@/i18n/routing";
import { load } from "@/lib/data";
import { absUrl, gameLd, pageMetadata } from "@/lib/seo";
import type { CatCard as CatCardT, Img, Seo } from "@/lib/types";
import { client } from "@/sanity/lib/client";
import { GAME_QUERY, GAME_SLUGS_QUERY } from "@/sanity/lib/queries";

type Game = {
  _id: string;
  url?: string | null;
  platforms?: string[];
  slug: string;
  title: string;
  summary?: string | null;
  howTo?: unknown;
  translated?: boolean;
  cover?: Img;
  cats?: CatCardT[];
  seo?: Seo;
};
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(GAME_SLUGS_QUERY, {}, { stega: false });
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const g = await load<Game | null>(GAME_QUERY, locale, { slug }, { stega: false });
  if (!g) return {};
  return pageMetadata({
    locale,
    path: `/playroom/${slug}`,
    title: g.seo?.title || g.title,
    description: g.seo?.description || g.summary,
    image: g.seo?.image ?? g.cover,
    noIndex: g.seo?.noIndex,
    untranslated: g.translated === false,
  });
}

export default async function GamePage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const [g, t] = await Promise.all([load<Game | null>(GAME_QUERY, locale, { slug }), getTranslations()]);
  if (!g) notFound();
  const url = absUrl(locale, `/playroom/${slug}`);
  return (
    <article className="wrap narrow">
      <Breadcrumb href="/playroom" label={t("playroom.title")} />
      <Untranslated show={g.translated === false} />
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <h1>{g.title}</h1>
        {g.summary && <p>{g.summary}</p>}
      </header>
      {g.cover?.asset && <div className="article-cover"><SanityImage image={g.cover} fill sizes="(max-width: 760px) 100vw, 760px" priority /></div>}
      <p style={{ marginBottom: 32 }}>
        {g.url ? (
          <a className="btn" href={g.url} target="_blank" rel="noopener noreferrer">
            {t("playroom.play")} ↗<span className="sr-only"> {t("common.external")}</span>
          </a>
        ) : (
          <span className="badge muted">{t("playroom.comingSoon")}</span>
        )}
        {!!g.platforms?.length && (
          <span className="small muted" style={{ marginLeft: 12 }}>
            {t("playroom.platforms")} · {g.platforms.map((p) => t(`platform.${p}`)).join("・")}
          </span>
        )}
      </p>
      <RichText value={g.howTo} />
      {!!g.cats?.length && (
        <section className="section">
          <SectionHead title={t("playroom.featuring")} />
          <div className="cat-grid">{g.cats.map((c) => <CatCard key={c._id} cat={c} showBrand />)}</div>
        </section>
      )}
      <JsonLd data={gameLd({ title: g.title, url, playUrl: g.url, image: g.cover, description: g.summary, platforms: g.platforms })} />
    </article>
  );
}
