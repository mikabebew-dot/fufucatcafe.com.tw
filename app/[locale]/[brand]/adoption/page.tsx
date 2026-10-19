import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatCard, FaqList, PageHead, SectionHead, Steps, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ADOPTION_BRAND } from "@/lib/constants";
import { load } from "@/lib/data";
import { faqLd, pageMetadata } from "@/lib/seo";
import type { CatCard as CatCardT, FaqItem, Seo, Step } from "@/lib/types";
import { ADOPTION_QUERY } from "@/sanity/lib/queries";

type Data = {
  guide: {
    title?: string;
    intro?: unknown;
    since?: number;
    steps?: Step[];
    requirements?: unknown;
    fees?: unknown;
    applyUrl?: string;
    faqs?: FaqItem[];
    translated?: boolean;
    seo?: Seo;
  } | null;
  cats: CatCardT[];
  graduated: number;
};

type Props = { params: Promise<{ locale: string; brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = (await params) as { locale: Locale; brand: string };
  if (brand !== ADOPTION_BRAND) return {};
  const [d, t] = await Promise.all([load<Data>(ADOPTION_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "adoption" })]);
  return pageMetadata({
    locale,
    path: `/${brand}/adoption`,
    title: d?.guide?.seo?.title || d?.guide?.title || t("title"),
    description: d?.guide?.seo?.description || (d?.cats?.length ? t("waiting", { count: d.cats.length }) : undefined),
    image: d?.guide?.seo?.image ?? d?.cats?.[0]?.cover,
    noIndex: d?.guide?.seo?.noIndex,
    untranslated: d?.guide?.translated === false,
  });
}

export default async function AdoptionPage({ params }: Props) {
  const { locale, brand } = (await params) as { locale: Locale; brand: string };
  if (brand !== ADOPTION_BRAND) notFound(); // 只有 NUKUNUKU 做中途認養
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<Data>(ADOPTION_QUERY, locale), getTranslations()]);
  const g = d?.guide;

  return (
    <>
      <PageHead title={g?.title || t("adoption.title")} />
      <div className="wrap">
        <Untranslated show={g?.translated === false} />
        <div className="stats">
          <div><b className="tabular">{d?.cats?.length ?? 0}</b><span>{t("adoption.waitingCount")}</span></div>
          <div><b className="tabular">{d?.graduated ?? 0}</b><span>{t("adoption.graduatedCount")}</span></div>
          <div><b className="tabular">{g?.since ?? "—"}</b><span>{t("adoption.since")}</span></div>
        </div>
      </div>

      {!!g?.intro && <div className="wrap section"><RichText value={g.intro} /></div>}

      <section className="wrap section">
        <SectionHead title={t("adoption.waitingTitle")} />
        {d?.cats?.length ? (
          <div className="cat-grid">{d.cats.map((c) => <CatCard key={c._id} cat={c} />)}</div>
        ) : (
          <p className="notice">{t("cats.empty")}</p>
        )}
      </section>

      <section className="wrap section">
        <div className="panel-accent stack" style={{ ["--gap" as string]: "18px" }}>
          <h2 style={{ fontSize: 22 }}>{t("adoption.steps")}</h2>
          <Steps steps={g?.steps} />
        </div>
      </section>

      {!!g?.requirements && (
        <section className="wrap section">
          <SectionHead title={t("adoption.requirements")} />
          <RichText value={g.requirements} />
        </section>
      )}
      {!!g?.fees && (
        <section className="wrap section">
          <SectionHead title={t("adoption.fees")} />
          <RichText value={g.fees} />
        </section>
      )}

      <section className="wrap section">
        {g?.applyUrl ? (
          <a className="btn" href={g.applyUrl} target="_blank" rel="noopener noreferrer">{t("adoption.apply")} ↗</a>
        ) : (
          <p className="notice">{t("adoption.applyNotReady")}</p>
        )}
        <p style={{ marginTop: 16 }}><Link className="text-link" href={`/${brand}/graduates`}>{t("graduates.title")} →</Link></p>
      </section>

      {!!g?.faqs?.length && (
        <section className="wrap narrow section">
          <SectionHead title={t("faq.title")} />
          <FaqList faqs={g.faqs} />
          <JsonLd data={faqLd(g.faqs)} />
        </section>
      )}
    </>
  );
}
