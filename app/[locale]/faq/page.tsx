import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaqList, PageHead } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import type { Locale } from "@/i18n/routing";
import { FAQ_CATEGORIES } from "@/lib/constants";
import { load } from "@/lib/data";
import { faqLd, pageMetadata } from "@/lib/seo";
import type { FaqItem, Seo } from "@/lib/types";
import { FAQ_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; seo?: Seo } | null; faqs: FaqItem[] };
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(FAQ_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "faq" })]);
  return pageMetadata({
    locale,
    path: "/faq",
    title: d?.page?.seo?.title || d?.page?.title || t("title"),
    description: d?.page?.seo?.description || d?.page?.intro || t("intro"),
    image: d?.page?.seo?.image,
    noIndex: d?.page?.seo?.noIndex,
  });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t, tc] = await Promise.all([load<Data>(FAQ_QUERY, locale), getTranslations("faq"), getTranslations("common")]);
  const faqs = d?.faqs ?? [];
  return (
    <>
      <PageHead title={d?.page?.title || t("title")} intro={d?.page?.intro || t("intro")} />
      <div className="wrap narrow">
        {FAQ_CATEGORIES.map((c) => {
          const list = faqs.filter((f) => (f.category ?? "visit") === c.value);
          if (!list.length) return null;
          return (
            <section key={c.value} className="faq-group" aria-labelledby={`faq-${c.value}`}>
              <h2 id={`faq-${c.value}`}>{t(`category.${c.value}`)}</h2>
              <FaqList faqs={list} />
            </section>
          );
        })}
        {!faqs.length && <p className="notice">{tc("empty")}</p>}
      </div>
      <JsonLd data={faqLd(faqs)} />
    </>
  );
}
