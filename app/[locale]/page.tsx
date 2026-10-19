import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatCard, FaqList, NewsList, SectionHead, Steps } from "@/components/blocks";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { JsonLd } from "@/components/JsonLd";
import { OpenStatus } from "@/components/OpenStatus";
import { SanityImage } from "@/components/SanityImage";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { BRANDS } from "@/lib/constants";
import { load } from "@/lib/data";
import { faqLd, pageMetadata } from "@/lib/seo";
import type { CatCard as CatCardT, FaqItem, GameCard, Img, NewsCard, Seo, Shop, Step } from "@/lib/types";
import { HOME_QUERY } from "@/sanity/lib/queries";

type HomeData = {
  page: {
    heroSlides?: HeroSlide[];
    headline?: string;
    subheadline?: string;
    aboutTitle?: string;
    aboutSummary?: string;
    game?: GameCard | null;
    seo?: Seo;
  } | null;
  brands: { brand: string; tagline?: string; image?: Img }[];
  shops: Shop[];
  steps?: Step[];
  cats: CatCardT[];
  waiting: number;
  news: NewsCard[];
  faqs: FaqItem[];
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const d = await load<HomeData>(HOME_QUERY, locale, {}, { stega: false });
  return pageMetadata({
    locale,
    path: "/",
    title: d?.page?.seo?.title,
    description: d?.page?.seo?.description || d?.page?.subheadline,
    image: d?.page?.seo?.image ?? d?.page?.heroSlides?.[0]?.image,
    noIndex: d?.page?.seo?.noIndex,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const [d, t] = await Promise.all([load<HomeData>(HOME_QUERY, locale), getTranslations()]);
  const page = d?.page;
  const shop = (id: string) => d?.shops?.find((s) => s.brand === id);

  return (
    <>
      {/* 1. 品牌質感：主視覺 */}
      {page?.heroSlides?.length ? <HeroCarousel slides={page.heroSlides} /> : null}
      <div className="wrap home-intro">
        <h1>{page?.headline || t("site.name")}</h1>
        {page?.subheadline && <p>{page.subheadline}</p>}
      </div>

      {/* 2. 客人最常找的：今日營業、價格、交通 */}
      <section className="wrap section" aria-labelledby="today">
        <h2 id="today" className="eyebrow" style={{ marginBottom: 10 }}>{t("home.today")}</h2>
        <div className="today">
          {BRANDS.map((b) => {
            const s = shop(b.id);
            const p = s?.prices?.[0];
            return (
              <Link key={b.id} href={`/${b.id}/visit`} className={`today-card ${b.id}`}>
                <span className="name">{b.name}</span>
                {s ? <OpenStatus hours={s.hours} special={s.specialDates} /> : <span />}
                {p && <span className="row tabular">{p.name} NT${p.weekday ?? "—"}{p.holiday != null && p.holiday !== p.weekday ? ` / NT$${p.holiday}` : ""}</span>}
                {s?.mrt && <span className="row" style={{ opacity: 0.85 }}>{s.mrt.split("\n")[0]}</span>}
                <span className="row more">{t("home.details")} →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. 兩個品牌入口：各自的識別 */}
      <section className="wrap section">
        <div className="brand-cards">
          {BRANDS.map((b) => {
            const info = d?.brands?.find((x) => x.brand === b.id);
            return (
              <Link key={b.id} href={`/${b.id}`} className={`brand-card ${b.id}`}>
                <div className="img">{info?.image?.asset && <SanityImage image={info.image} fill sizes="(max-width: 767px) 100vw, 50vw" />}</div>
                <div className="body">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="logo" src={b.logo} alt={b.official} width={72} height={72} />
                  <div>
                    {info?.tagline && <p style={{ marginBottom: 6 }}>{info.tagline}</p>}
                    <span className="cta">{t("home.brandCta", { brand: b.name })} →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. 品牌理念 */}
      {(page?.aboutTitle || page?.aboutSummary) && (
        <section className="wrap narrow section">
          <p className="eyebrow" style={{ marginBottom: 8 }}>{t("home.aboutEyebrow")}</p>
          {page.aboutTitle && <h2 style={{ fontSize: 24, marginBottom: 12 }}>{page.aboutTitle}</h2>}
          {page.aboutSummary && <p className="muted" style={{ marginBottom: 16, whiteSpace: "pre-line" }}>{page.aboutSummary}</p>}
          <Link className="text-link" href="/about">{t("home.aboutCta")} →</Link>
        </section>
      )}

      {/* 5. 第一次來店 */}
      <section className="wrap section">
        <div className="panel stack" style={{ ["--gap" as string]: "18px" }}>
          <div>
            <h2 style={{ fontSize: 22 }}>{t("home.firstVisitTitle")}</h2>
            <p className="muted small">{t("home.firstVisitText")}</p>
          </div>
          <Steps steps={d?.steps} />
          <Link className="btn btn-block" href="/first-visit">{t("home.firstVisitCta")}</Link>
        </div>
      </section>

      {/* 6. 貓咪 */}
      {!!d?.cats?.length && (
        <section className="section">
          <div className="wrap"><SectionHead title={t("home.catsTitle")} href="/cats" linkLabel={t("common.viewAll")} /></div>
          <div className="cat-scroller">
            {d.cats.map((c) => <CatCard key={c._id} cat={c} showBrand />)}
          </div>
        </section>
      )}

      {/* 7. NUKUNUKU 認養 */}
      <section className="wrap section" data-brand="nukunuku">
        <div className="panel-accent stack" style={{ ["--gap" as string]: "10px" }}>
          <p className="eyebrow" style={{ color: "inherit", opacity: 0.85 }}>{t("adoption.eyebrow")}</p>
          <h2 style={{ fontSize: 24 }}>{d?.waiting ? t("adoption.waiting", { count: d.waiting }) : t("adoption.title")}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            <Link className="btn" href="/nukunuku/adoption">{t("adoption.seeCats")}</Link>
            <Link className="btn btn-ghost" href="/nukunuku/graduates">{t("home.graduatesCta")}</Link>
          </div>
        </div>
      </section>

      {/* 8. 消息 */}
      {!!d?.news?.length && (
        <section className="wrap section">
          <SectionHead title={t("home.newsTitle")} href="/news" linkLabel={t("common.viewAll")} />
          <NewsList items={d.news} />
        </section>
      )}

      {/* 9. 遊樂室：低調的延伸 */}
      {page?.game && (
        <section className="wrap section">
          <Link href={`/playroom/${page.game.slug}`} className="game-teaser">
            <div className="img">{page.game.cover?.asset && <SanityImage image={page.game.cover} fill sizes="88px" />}</div>
            <div>
              <p className="eyebrow">{t("playroom.title")}</p>
              <p style={{ fontWeight: 500 }}>{page.game.title}</p>
              <p className="small muted">{page.game.url ? t("playroom.teaser") : t("playroom.comingSoon")} →</p>
            </div>
          </Link>
        </section>
      )}

      {/* 10. 常見問題 */}
      {!!d?.faqs?.length && (
        <section className="wrap narrow section">
          <h2 style={{ fontSize: 22, marginBottom: 6 }}>{t("home.faqTitle")}</h2>
          <FaqList faqs={d.faqs} />
          <p style={{ marginTop: 14 }}><Link className="text-link" href="/faq">{t("faq.all")} →</Link></p>
          <JsonLd data={faqLd(d.faqs)} />
        </section>
      )}
    </>
  );
}
