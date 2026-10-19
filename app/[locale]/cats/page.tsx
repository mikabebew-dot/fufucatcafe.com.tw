import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatCard, PageHead } from "@/components/blocks";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { BRANDS, isBrand } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { CatCard as CatCardT, Img, Seo } from "@/lib/types";
import { CATS_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; cover?: Img; seo?: Seo } | null; cats: CatCardT[] };
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ shop?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(CATS_QUERY, locale, { brand: null, status: null }, { stega: false }), getTranslations({ locale, namespace: "cats" })]);
  return pageMetadata({
    locale,
    path: "/cats",
    title: d?.page?.seo?.title || d?.page?.title || t("allCats"),
    description: d?.page?.seo?.description || d?.page?.intro || t("intro"),
    image: d?.page?.seo?.image ?? d?.page?.cover ?? d?.cats?.[0]?.cover,
    noIndex: d?.page?.seo?.noIndex,
  });
}

/** 兩店所有貓咪（已畢業的不列出），可依店篩選 */
export default async function AllCatsPage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const shop = (await searchParams).shop;
  const brand = shop && isBrand(shop) ? shop : null;
  const [d, t] = await Promise.all([load<Data>(CATS_QUERY, locale, { brand, status: null }), getTranslations("cats")]);
  return (
    <>
      <PageHead title={d?.page?.title || t("allCats")} intro={d?.page?.intro || t("intro")} cover={d?.page?.cover} />
      <div className="wrap">
        <nav className="filters" aria-label={t("shop")}>
          <Link href="/cats" aria-current={!brand ? "page" : undefined}>{t("all")}</Link>
          {BRANDS.map((b) => (
            <Link key={b.id} href={`/cats?shop=${b.id}`} aria-current={brand === b.id ? "page" : undefined}>{b.name}</Link>
          ))}
        </nav>
        {d?.cats?.length ? (
          <div className="cat-grid">{d.cats.map((c, i) => <CatCard key={c._id} cat={c} showBrand={!brand} priority={i < 4} />)}</div>
        ) : (
          <p className="notice">{t("empty")}</p>
        )}
      </div>
    </>
  );
}
