import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCard, PageHead } from "@/components/blocks";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Img, NewsCard as NewsCardT, Seo } from "@/lib/types";
import { NEWS_LIST_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; cover?: Img; seo?: Seo } | null; news: NewsCardT[] };
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(NEWS_LIST_QUERY, locale, { category: null }, { stega: false }), getTranslations({ locale, namespace: "news" })]);
  return pageMetadata({
    locale,
    path: "/news",
    title: d?.page?.seo?.title || d?.page?.title || t("title"),
    description: d?.page?.seo?.description || d?.page?.intro,
    image: d?.page?.seo?.image ?? d?.page?.cover,
    noIndex: d?.page?.seo?.noIndex,
  });
}

export default async function NewsListPage({ params, searchParams }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const requested = (await searchParams).category;
  const category = NEWS_CATEGORIES.some((c) => c.value === requested) ? requested! : null;
  const [d, t] = await Promise.all([load<Data>(NEWS_LIST_QUERY, locale, { category }), getTranslations()]);
  return (
    <>
      <PageHead title={d?.page?.title || t("news.title")} intro={d?.page?.intro} />
      <div className="wrap">
        <nav className="filters" aria-label={t("news.title")}>
          <Link href="/news" aria-current={!category ? "page" : undefined}>{t("cats.all")}</Link>
          {NEWS_CATEGORIES.map((c) => (
            <Link key={c.value} href={`/news?category=${c.value}`} aria-current={category === c.value ? "page" : undefined}>
              {t(`news.category.${c.value}`)}
            </Link>
          ))}
        </nav>
        {d?.news?.length ? (
          <div className="news-grid">{d.news.map((n) => <NewsCard key={n._id} item={n} />)}</div>
        ) : (
          <p className="notice">{t("news.empty")}</p>
        )}
      </div>
    </>
  );
}
