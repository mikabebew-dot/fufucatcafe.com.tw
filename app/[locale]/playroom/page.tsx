import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GameCard, PageHead } from "@/components/blocks";
import type { Locale } from "@/i18n/routing";
import { load } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import type { GameCard as GameCardT, Img, Seo } from "@/lib/types";
import { GAMES_QUERY } from "@/sanity/lib/queries";

type Data = { page: { title?: string; intro?: string; cover?: Img; seo?: Seo } | null; games: GameCardT[] };
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const [d, t] = await Promise.all([load<Data>(GAMES_QUERY, locale, {}, { stega: false }), getTranslations({ locale, namespace: "playroom" })]);
  return pageMetadata({
    locale,
    path: "/playroom",
    title: d?.page?.seo?.title || d?.page?.title || t("title"),
    description: d?.page?.seo?.description || d?.page?.intro || t("intro"),
    image: d?.page?.seo?.image ?? d?.page?.cover,
    noIndex: d?.page?.seo?.noIndex,
  });
}

/** 遊戲是品牌體驗的延伸：版面與其他頁面一致，不做成遊戲平台 */
export default async function PlayroomPage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t, tc] = await Promise.all([load<Data>(GAMES_QUERY, locale), getTranslations("playroom"), getTranslations("common")]);
  return (
    <>
      <PageHead title={d?.page?.title || t("title")} intro={d?.page?.intro || t("intro")} cover={d?.page?.cover} />
      <div className="wrap">
        {d?.games?.length ? (
          <div className="game-grid">{d.games.map((g) => <GameCard key={g._id} game={g} />)}</div>
        ) : (
          <p className="notice">{tc("comingSoon")}</p>
        )}
      </div>
    </>
  );
}
