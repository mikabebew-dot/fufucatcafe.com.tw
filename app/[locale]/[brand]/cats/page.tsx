import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatCard, PageHead } from "@/components/blocks";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { CAT_STATUS, brandOf, type BrandId } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { CatCard as CatCardT } from "@/lib/types";
import { CATS_QUERY } from "@/sanity/lib/queries";

type Props = { params: Promise<{ locale: string; brand: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  const t = await getTranslations({ locale, namespace: "cats" });
  return pageMetadata({ locale, path: `/${brand}/cats`, title: t("brandCats", { brand: brandOf(brand).name }) });
}

export default async function BrandCatsPage({ params, searchParams }: Props) {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  setRequestLocale(locale);
  const statuses = CAT_STATUS.filter((s) => (s.brands as readonly string[]).includes(brand));
  const requested = (await searchParams).status;
  const status = statuses.some((s) => s.value === requested) ? requested! : null;
  const [d, t] = await Promise.all([
    load<{ cats: CatCardT[] }>(CATS_QUERY, locale, { brand, status }),
    getTranslations(),
  ]);

  return (
    <>
      <PageHead title={t("cats.brandCats", { brand: brandOf(brand).name })} />
      <div className="wrap">
        <nav className="filters" aria-label={t("cats.title")}>
          <Link href={`/${brand}/cats`} aria-current={!status ? "page" : undefined}>{t("cats.all")}</Link>
          {statuses.map((s) => (
            <Link key={s.value} href={`/${brand}/cats?status=${s.value}`} aria-current={status === s.value ? "page" : undefined}>
              {t(`catStatus.${s.value}`)}
            </Link>
          ))}
        </nav>
        {d?.cats?.length ? (
          <div className="cat-grid">{d.cats.map((c, i) => <CatCard key={c._id} cat={c} priority={i < 4} />)}</div>
        ) : (
          <p className="notice">{t("cats.empty")}</p>
        )}
      </div>
    </>
  );
}
