import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaqList, PageHead, SectionHead, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { BRANDS } from "@/lib/constants";
import { load } from "@/lib/data";
import { absUrl, faqLd, pageMetadata } from "@/lib/seo";
import type { FaqItem, Seo, Step } from "@/lib/types";
import { FIRST_VISIT_QUERY } from "@/sanity/lib/queries";

type Data = {
  guide: {
    title?: string;
    intro?: string;
    steps?: Step[];
    differences?: { _key: string; topic?: string; fufu?: string; nukunuku?: string }[];
    notes?: unknown;
    faqs?: FaqItem[];
    translated?: boolean;
    seo?: Seo;
  } | null;
};
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(FIRST_VISIT_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "nav" })]);
  return pageMetadata({
    locale,
    path: "/first-visit",
    title: d?.guide?.seo?.title || d?.guide?.title || t("firstVisit"),
    description: d?.guide?.seo?.description || d?.guide?.intro,
    image: d?.guide?.seo?.image ?? d?.guide?.steps?.find((s) => s.image?.asset)?.image,
    noIndex: d?.guide?.seo?.noIndex,
    untranslated: d?.guide?.translated === false,
  });
}

export default async function FirstVisitPage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<Data>(FIRST_VISIT_QUERY, locale), getTranslations()]);
  const g = d?.guide;
  const steps = g?.steps ?? [];
  const howTo = steps.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: g?.title || t("nav.firstVisit"),
        description: g?.intro || undefined,
        url: absUrl(locale, "/first-visit"),
        step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text || s.title })),
      }
    : null;

  return (
    <>
      <PageHead title={g?.title || t("nav.firstVisit")} intro={g?.intro} />
      <div className="wrap">
        <Untranslated show={g?.translated === false} />
        {/* 步驟：真實的先後順序 */}
        <ol className="steps" style={{ gap: 28 }}>
          {steps.map((s, i) => (
            <li key={s._key}>
              <span className="num" aria-hidden="true">{i + 1}</span>
              <div className="stack" style={{ ["--gap" as string]: "8px" }}>
                <b style={{ fontSize: 18 }}>{s.title}</b>
                {s.text && <p style={{ fontSize: 15, whiteSpace: "pre-line" }}>{s.text}</p>}
                {s.image?.asset && (
                  <div className="page-cover" style={{ aspectRatio: "4 / 3", maxWidth: 520 }}>
                    <SanityImage image={s.image} fill sizes="(max-width: 600px) 100vw, 520px" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {!!g?.differences?.length && (
        <section className="wrap section">
          <SectionHead title="FUFU / NUKUNUKU" />
          <div className="table-box">
            <table className="price-table">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">—</span></th>
                  {BRANDS.map((b) => <th key={b.id} scope="col">{b.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {g.differences.map((r) => (
                  <tr key={r._key}><th scope="row" style={{ background: "transparent" }}>{r.topic}</th><td>{r.fufu}</td><td>{r.nukunuku}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!!g?.notes && <div className="wrap section"><RichText value={g.notes} /></div>}

      <section className="wrap section">
        <div className="btn-row">
          <Link className="btn" href="/visit">{t("nav.visit")}</Link>
          <Link className="btn btn-ghost" href="/faq">{t("nav.faq")}</Link>
        </div>
      </section>

      {!!g?.faqs?.length && (
        <section className="wrap narrow section">
          <SectionHead title={t("faq.title")} />
          <FaqList faqs={g.faqs} />
        </section>
      )}
      <JsonLd data={[howTo, g?.faqs?.length ? faqLd(g.faqs) : null]} />
    </>
  );
}
