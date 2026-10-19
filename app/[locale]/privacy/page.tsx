import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContentPage, type ContentDoc } from "@/components/ContentPage";
import type { Locale } from "@/i18n/routing";
import { SINGLETON } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { Seo } from "@/lib/types";
import { CONTENT_PAGE_QUERY } from "@/sanity/lib/queries";

type Doc = (ContentDoc & { seo?: Seo }) | null;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Doc>(CONTENT_PAGE_QUERY, locale, { id: SINGLETON.privacy }, { stega: false }), getTranslations({ locale, namespace: "nav" })]);
  return pageMetadata({
    locale,
    path: "/privacy",
    title: d?.seo?.title || d?.title || t("privacy"),
    description: d?.seo?.description || d?.intro,
    image: d?.seo?.image ?? d?.cover,
    noIndex: d?.seo?.noIndex,
    untranslated: d?.translated === false,
  });
}

export default async function Page({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<Doc>(CONTENT_PAGE_QUERY, locale, { id: SINGLETON.privacy }), getTranslations("nav")]);
  return <ContentPage doc={d} fallbackTitle={t("privacy")} />;
}
