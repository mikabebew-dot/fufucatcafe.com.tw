import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ADOPTION_BRAND } from "@/lib/constants";
import { load } from "@/lib/data";
import { absUrl, articleLd, pageMetadata } from "@/lib/seo";
import type { Img, Seo } from "@/lib/types";
import { client } from "@/sanity/lib/client";
import { STORY_QUERY, STORY_SLUGS_QUERY } from "@/sanity/lib/queries";

type StoryDoc = {
  _id: string;
  graduatedAt: string;
  _updatedAt: string;
  slug: string;
  title?: string | null;
  catName?: string;
  cat?: { slug: string; brand: string } | null;
  familyWords?: string | null;
  body?: unknown;
  photos?: NonNullable<Img>[];
  image?: Img;
  translated?: boolean;
  seo?: Seo;
};
type Props = { params: Promise<{ locale: string; brand: string; slug: string }> };

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(STORY_SLUGS_QUERY, {}, { stega: false });
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, brand: ADOPTION_BRAND, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand, slug } = (await params) as { locale: Locale; brand: string; slug: string };
  if (brand !== ADOPTION_BRAND) return {};
  const [s, t] = await Promise.all([load<StoryDoc | null>(STORY_QUERY, locale, { slug }, { stega: false }), getTranslations({ locale, namespace: "graduates" })]);
  if (!s) return {};
  return pageMetadata({
    locale,
    path: `/${brand}/graduates/${slug}`,
    title: s.seo?.title || s.title || t("newLife", { name: s.catName ?? "" }),
    description: s.seo?.description || s.familyWords,
    image: s.seo?.image ?? s.image,
    noIndex: s.seo?.noIndex,
    untranslated: s.translated === false,
    type: "article",
  });
}

export default async function StoryPage({ params }: Props) {
  const { locale, brand, slug } = (await params) as { locale: Locale; brand: string; slug: string };
  if (brand !== ADOPTION_BRAND) notFound();
  setRequestLocale(locale);
  const [s, t, format] = await Promise.all([load<StoryDoc | null>(STORY_QUERY, locale, { slug }), getTranslations("graduates"), getFormatter()]);
  if (!s) notFound();
  const title = s.title || t("newLife", { name: s.catName ?? "" });
  const date = format.dateTime(new Date(s.graduatedAt), { year: "numeric", month: "2-digit" });
  const url = absUrl(locale, `/${brand}/graduates/${slug}`);
  return (
    <article className="wrap narrow">
      <Breadcrumb href={`/${brand}/graduates`} label={t("title")} />
      <Untranslated show={s.translated === false} />
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <p className="small muted">{t("graduatedOn", { date })}</p>
        <h1>{title}</h1>
      </header>
      {s.image?.asset && <div className="article-cover"><SanityImage image={s.image} fill sizes="(max-width: 760px) 100vw, 760px" priority /></div>}
      {s.familyWords && (
        <figure style={{ margin: 0 }}>
          <figcaption className="small muted">{t("family")}</figcaption>
          <blockquote className="quote">{s.familyWords}</blockquote>
        </figure>
      )}
      <RichText value={s.body} />
      {(s.photos?.length ?? 0) > 1 && (
        <div className="gallery section">
          {s.photos!.slice(1).map((img, i) => (
            <figure key={img._key ?? i}><div className="img"><SanityImage image={img} fill sizes="(max-width: 767px) 50vw, 25vw" /></div></figure>
          ))}
        </div>
      )}
      {s.cat?.slug && (
        <p className="section"><Link className="text-link" href={`/${s.cat.brand}/cats/${s.cat.slug}`}>{s.catName} →</Link></p>
      )}
      <JsonLd data={articleLd({ type: "Article", title, url, image: s.image, published: s.graduatedAt, modified: s._updatedAt, description: s.familyWords, locale })} />
    </article>
  );
}
