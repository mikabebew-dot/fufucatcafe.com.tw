import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHead } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { VisitFull } from "@/components/visit";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { BRANDS } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata, shopLd } from "@/lib/seo";
import type { Img, Seo, Shop } from "@/lib/types";
import { SHOPS_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; cover?: Img; seo?: Seo } | null; shops: Shop[] };
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(SHOPS_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "visit" })]);
  return pageMetadata({
    locale,
    path: "/visit",
    title: d?.page?.seo?.title || d?.page?.title || t("title"),
    description: d?.page?.seo?.description || d?.page?.intro || t("intro"),
    image: d?.page?.seo?.image ?? d?.page?.cover,
    noIndex: d?.page?.seo?.noIndex,
  });
}

/** 兩店並列：客人從頁首按鈕一鍵到達 */
export default async function VisitPage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<Data>(SHOPS_QUERY, locale), getTranslations("visit")]);
  return (
    <>
      <PageHead title={d?.page?.title || t("title")} intro={d?.page?.intro || t("intro")} />
      <div className="wrap visit-compare">
        {BRANDS.map((b) => {
          const shop = d?.shops?.find((s) => s.brand === b.id);
          return (
            <section key={b.id} data-brand={b.id} className="panel" aria-labelledby={`shop-${b.id}`} style={{ background: "var(--ground)" }}>
              <Link href={`/${b.id}`} id={`shop-${b.id}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", marginBottom: 24 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt="" width={56} height={56} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: b.id === "fufu" ? "50%" : 12 }} />
                <span style={{ fontFamily: "var(--font-eyebrow)", fontSize: 20, letterSpacing: ".08em", color: "var(--accent-text)" }}>{b.official}</span>
              </Link>
              {shop ? <VisitFull shop={shop} headingLevel={3} /> : <p className="notice">{t("notReady")}</p>}
            </section>
          );
        })}
      </div>
      <JsonLd data={(d?.shops ?? []).map((s) => shopLd(s, locale))} />
    </>
  );
}
