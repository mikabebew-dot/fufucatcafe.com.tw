import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumb, StatusBadge, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { ADOPTION_BRAND, brandOf, type BrandId } from "@/lib/constants";
import { load } from "@/lib/data";
import { absUrl, breadcrumbLd, catLd, pageMetadata } from "@/lib/seo";
import type { Img, Seo } from "@/lib/types";
import { client } from "@/sanity/lib/client";
import { CAT_PATHS_QUERY, CAT_QUERY } from "@/sanity/lib/queries";

type Cat = {
  _id: string;
  brand: BrandId;
  status: string;
  gender?: "male" | "female" | "unknown";
  birthday?: string;
  arrivedAt?: string;
  neutered?: boolean;
  vaccinated?: boolean;
  graduatedAt?: string;
  _updatedAt: string;
  slug: string;
  name: string;
  summary?: string;
  breed?: string;
  color?: string;
  traits?: string[];
  story?: unknown;
  healthNote?: string;
  adoptionNote?: string;
  translated?: boolean;
  cover?: Img;
  photos?: NonNullable<Img>[];
  graduateStory?: { slug: string } | null;
  applyUrl?: string;
  nameZh?: string;
  seo?: Seo;
};

/** Google 表單預先填好「想認養哪隻」 */
const APPLY_ENTRY = "entry.1409116492";
function applyLink(url: string, name: string) {
  if (!/docs\.google\.com\/forms\/.+\/viewform/.test(url)) return url;
  const u = new URL(url);
  u.searchParams.set("usp", "pp_url");
  u.searchParams.set(APPLY_ENTRY, name);
  return u.toString();
}

type Props = { params: Promise<{ locale: string; brand: string; slug: string }> };

export async function generateStaticParams() {
  const paths: { brand: string; slug: string }[] = await client.fetch(CAT_PATHS_QUERY, {}, { stega: false });
  return routing.locales.flatMap((locale) => paths.map((p) => ({ locale, ...p })));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand, slug } = (await params) as { locale: Locale; brand: BrandId; slug: string };
  const cat = await load<Cat | null>(CAT_QUERY, locale, { brand, slug }, { stega: false });
  if (!cat) return {};
  return pageMetadata({
    locale,
    path: `/${brand}/cats/${slug}`,
    title: cat.seo?.title || `${cat.name}・${brandOf(brand).name}`,
    description: cat.seo?.description || cat.summary,
    image: cat.seo?.image ?? cat.cover,
    noIndex: cat.seo?.noIndex,
    untranslated: cat.translated === false,
  });
}

/** 依生日算出年齡（年、月） */
function age(birthday?: string) {
  if (!birthday) return null;
  const b = new Date(birthday), now = new Date();
  let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) m--;
  return m < 0 ? null : { y: Math.floor(m / 12), m: m % 12 };
}

export default async function CatPage({ params }: Props) {
  const { locale, brand, slug } = (await params) as { locale: Locale; brand: BrandId; slug: string };
  setRequestLocale(locale);
  const [cat, t, tc, format] = await Promise.all([
    load<Cat | null>(CAT_QUERY, locale, { brand, slug }),
    getTranslations(),
    getTranslations("cats"),
    getFormatter(),
  ]);
  if (!cat) notFound();
  const b = brandOf(brand);
  const isNuku = brand === ADOPTION_BRAND;
  const date = (d?: string) => (d ? format.dateTime(new Date(d), { year: "numeric", month: "2-digit", day: "2-digit" }) : null);
  const gender = cat.gender ? { male: tc("male"), female: tc("female"), unknown: tc("unknownGender") }[cat.gender] : null;
  const a = age(cat.birthday);
  const health = [cat.neutered && tc("neutered"), cat.vaccinated && tc("vaccinated")].filter(Boolean).join("・");
  const facts = [
    [tc("gender"), gender],
    [tc("age"), a ? (a.y === 0 ? tc("months", { n: a.m }) : a.m ? tc("yearsMonths", { y: a.y, m: a.m }) : tc("years", { n: a.y })) : null],
    [tc("breed"), cat.breed],
    [tc("color"), cat.color],
    [tc("shop"), b.name],
    ...(isNuku ? [[tc("arrived"), date(cat.arrivedAt)], [tc("health"), health || null]] : []),
  ].filter(([, v]) => v) as [string, string][];
  const url = absUrl(locale, `/${brand}/cats/${slug}`);

  return (
    <article className="wrap">
      <Breadcrumb href={`/${brand}/cats`} label={tc("brandCats", { brand: b.name })} />
      <Untranslated show={cat.translated === false} />
      <div className="cat-top">
        <div className="img">{cat.cover?.asset && <SanityImage image={cat.cover} fill sizes="(max-width: 899px) 100vw, 50vw" priority />}</div>
        <div>
          <StatusBadge status={cat.status} />
          <h1>{cat.name}</h1>
          {cat.summary && <p className="lead">{cat.summary}</p>}
          {facts.length > 0 && (
            <dl className="facts">
              {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          )}
          {!!cat.traits?.length && (
            <ul className="tags" aria-label={tc("traits")}>
              {cat.traits.map((x) => <li key={x}>{x}</li>)}
            </ul>
          )}
          {isNuku && (cat.healthNote || cat.adoptionNote) && (
            <div className="notice" style={{ marginTop: 20, whiteSpace: "pre-line" }}>
              {[cat.healthNote, cat.adoptionNote].filter(Boolean).join("\n\n")}
            </div>
          )}
          {isNuku && cat.status === "adoptable" && cat.applyUrl && (
            <div className="apply-box">
              <p className="apply-actions">
                <a className="btn" href={applyLink(cat.applyUrl, cat.nameZh || cat.name)} target="_blank" rel="noopener noreferrer">{tc("applyCta")} ↗</a>
                <Link className="text-link" href={`/${brand}/adoption`}>{tc("adoptCta")} →</Link>
              </p>
              <p className="apply-hint">{tc("applyHint")}</p>
            </div>
          )}
          {isNuku && (cat.status === "matching" || (cat.status === "adoptable" && !cat.applyUrl)) && (
            <p style={{ marginTop: 20 }}><Link className="btn" href={`/${brand}/adoption`}>{tc("adoptCta")}</Link></p>
          )}
          {cat.graduateStory?.slug && (
            <p style={{ marginTop: 20 }}>
              <Link className="text-link" href={`/${brand}/graduates/${cat.graduateStory.slug}`}>{t("graduates.newLife", { name: cat.name })} →</Link>
            </p>
          )}
        </div>
      </div>

      <div className="section"><RichText value={cat.story} /></div>

      {!!cat.photos?.length && (
        <section className="section">
          <h2 style={{ fontSize: 20, marginBottom: 14 }}>{tc("photos")}</h2>
          <div className="gallery">
            {cat.photos.map((img, i) => (
              <figure key={img._key ?? i}>
                <div className="img"><SanityImage image={img} fill sizes="(max-width: 767px) 50vw, 25vw" /></div>
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={[
          catLd({ name: cat.name, url, image: cat.cover, description: cat.summary, brand, locale }),
          breadcrumbLd([
            { name: b.official, url: absUrl(locale, `/${brand}`) },
            { name: tc("brandCats", { brand: b.name }), url: absUrl(locale, `/${brand}/cats`) },
            { name: cat.name, url },
          ]),
        ]}
      />
    </article>
  );
}
