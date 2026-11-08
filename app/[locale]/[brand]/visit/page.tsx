import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHead } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { VisitFull } from "@/components/visit";
import type { Locale } from "@/i18n/routing";
import { brandOf, shopDocId, type BrandId } from "@/lib/constants";
import { load } from "@/lib/data";
import { absUrl, breadcrumbLd, pageMetadata, shopLd } from "@/lib/seo";
import type { Shop } from "@/lib/types";
import { SHOP_QUERY } from "@/sanity/lib/queries";
import { SanityImage } from "@/components/SanityImage";
import { urlFor } from "@/sanity/lib/image";

type Props = { params: Promise<{ locale: string; brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  const [shop, t] = await Promise.all([
    load<Shop | null>(SHOP_QUERY, locale, { shopId: shopDocId(brand) }, { stega: false }),
    getTranslations({ locale, namespace: "visit" }),
  ]);
  const b = brandOf(brand);
  return pageMetadata({
    locale,
    path: `/${brand}/visit`,
    title: shop?.seo?.title || `${b.name} ${t("title")}`,
    description: shop?.seo?.description || [shop?.address, shop?.prices?.[0] && `${shop.prices[0].name} NT$${shop.prices[0].weekday}`].filter(Boolean).join("・"),
    image: shop?.seo?.image,
    noIndex: shop?.seo?.noIndex,
  });
}

export default async function BrandVisitPage({ params }: Props) {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  setRequestLocale(locale);
  const [shop, t] = await Promise.all([load<Shop | null>(SHOP_QUERY, locale, { shopId: shopDocId(brand) }), getTranslations("visit")]);
  const b = brandOf(brand);
  return (
    <>
      <PageHead title={`${b.name} ${t("title")}`} intro={shop?.address} />
      <div className="wrap narrow">
        {shop ? <VisitFull shop={shop} /> : <p className="notice">{t("notReady")}</p>}
      </div>
      {!!shop?.menuImages?.length && (
        <section id="menu" className="wrap section menu-section" aria-labelledby="menu-title">
          <h2 id="menu-title">{t("menu")}</h2>
          <p className="menu-note">{t("menuNote")}</p>
          <div className="menu-grid">
            {shop.menuImages.map((img, i) => (
              <a key={i} className="menu-img" href={urlFor(img).width(1600).url()} target="_blank" rel="noopener noreferrer">
                <SanityImage image={img} fill sizes="(max-width: 767px) 100vw, 50vw" />
              </a>
            ))}
          </div>
        </section>
      )}
      {shop && (
        <JsonLd
          data={[
            shopLd(shop, locale),
            breadcrumbLd([
              { name: b.official, url: absUrl(locale, `/${brand}`) },
              { name: t("title"), url: absUrl(locale, `/${brand}/visit`) },
            ]),
          ]}
        />
      )}
    </>
  );
}
