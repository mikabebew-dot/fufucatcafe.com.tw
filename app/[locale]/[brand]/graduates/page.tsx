import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHead, StoryCard } from "@/components/blocks";
import type { Locale } from "@/i18n/routing";
import { ADOPTION_BRAND } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Img, Seo, Story } from "@/lib/types";
import { STORIES_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; cover?: Img; seo?: Seo } | null; stories: Story[] };
type Props = { params: Promise<{ locale: string; brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = (await params) as { locale: Locale; brand: string };
  if (brand !== ADOPTION_BRAND) return {};
  const [d, t] = await Promise.all([load<Data>(STORIES_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "graduates" })]);
  return pageMetadata({
    locale,
    path: `/${brand}/graduates`,
    title: d?.page?.seo?.title || d?.page?.title || t("title"),
    description: d?.page?.seo?.description || d?.page?.intro || t("intro"),
    image: d?.page?.seo?.image ?? d?.page?.cover,
    noIndex: d?.page?.seo?.noIndex,
  });
}

export default async function GraduatesPage({ params }: Props) {
  const { locale, brand } = (await params) as { locale: Locale; brand: string };
  if (brand !== ADOPTION_BRAND) notFound();
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<Data>(STORIES_QUERY, locale), getTranslations("graduates")]);
  const [first, ...rest] = d?.stories ?? [];
  return (
    <>
      <PageHead title={d?.page?.title || t("title")} intro={d?.page?.intro || t("intro")} cover={d?.page?.cover} />
      <div className="wrap stack" style={{ ["--gap" as string]: "24px" }}>
        {first ? <StoryCard story={first} feature /> : <p className="notice">{t("empty")}</p>}
        {rest.length > 0 && <div className="story-grid">{rest.map((s) => <StoryCard key={s._id} story={s} />)}</div>}
      </div>
    </>
  );
}
