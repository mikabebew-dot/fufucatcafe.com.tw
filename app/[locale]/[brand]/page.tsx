import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatCard, NewsList, SectionHead, Steps, StoryCard, Untranslated } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { SanityImage } from "@/components/SanityImage";
import { InfoCard, PriceTable, RulesList } from "@/components/visit";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ADOPTION_BRAND, BRANDS, brandDocId, brandOf, shopDocId, type BrandId } from "@/lib/constants";
import { load } from "@/lib/data";
import { pageMetadata, shopLd } from "@/lib/seo";
import type { CatCard as CatCardT, Img, NewsCard, Seo, Shop, Step, Story } from "@/lib/types";
import { BRAND_QUERY } from "@/sanity/lib/queries";

type BrandData = {
  brand: {
    headline?: string;
    subheadline?: string;
    storyTitle?: string;
    story?: unknown;
    translated?: boolean;
    spend?: Step[];
    hero?: Img;
    storyImage?: Img;
    space?: NonNullable<Img>[];
    seo?: Seo;
  } | null;
  shop: Shop | null;
  cats: CatCardT[];
  waitingCats: CatCardT[];
  catCount: number;
  news: NewsCard[];
  adoption: { since?: number; steps?: Step[]; applyUrl?: string } | null;
  waiting: number;
  graduated: number;
  stories: Story[];
};

type Props = { params: Promise<{ locale: string; brand: string }> };

const fetchBrand = (locale: Locale, brand: BrandId, stega = true) =>
  load<BrandData>(BRAND_QUERY, locale, { brand, brandId: brandDocId(brand), shopId: shopDocId(brand) }, { stega });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  const d = await fetchBrand(locale, brand, false);
  const b = brandOf(brand);
  return pageMetadata({
    locale,
    path: `/${brand}`,
    title: d?.brand?.seo?.title || b.official,
    description: d?.brand?.seo?.description || d?.brand?.subheadline || d?.brand?.headline,
    image: d?.brand?.seo?.image ?? d?.brand?.hero,
    noIndex: d?.brand?.seo?.noIndex,
    untranslated: d?.brand?.translated === false,
  });
}

export default async function BrandPage({ params }: Props) {
  const { locale, brand } = (await params) as { locale: Locale; brand: BrandId };
  setRequestLocale(locale);
  const [d, t] = await Promise.all([fetchBrand(locale, brand), getTranslations()]);
  const b = brandOf(brand);
  const other = BRANDS.find((x) => x.id !== brand)!;
  const page = d?.brand;
  const isNuku = brand === ADOPTION_BRAND;
  const showcase = isNuku && d?.waitingCats?.length ? d.waitingCats : d?.cats ?? [];

  return (
    <>
      {/* 主視覺 */}
      <section className="wrap brand-hero">
        <div className="img">{page?.hero?.asset && <SanityImage image={page.hero} fill sizes="(max-width: 1180px) 100vw, 1180px" priority />}</div>
        <Untranslated show={page?.translated === false} />
        <h1>{page?.headline || b.official}</h1>
        {page?.subheadline && <p>{page.subheadline}</p>}
      </section>

      {/* 來店資訊卡：與另一品牌同位置、同結構 */}
      <div className="wrap section" style={{ paddingTop: 28 }}>
        <InfoCard shop={d?.shop ?? null} brand={brand} />
      </div>

      {/* 理念 */}
      {(page?.storyTitle || page?.story) && (
        <section className="wrap section">
          <div className="story">
            <div className="stack" style={{ ["--gap" as string]: "12px" }}>
              <p className="eyebrow">{t("brand.story")}</p>
              {page.storyTitle && <h2 style={{ fontSize: "clamp(22px, 3.4vw, 32px)" }}>{page.storyTitle}</h2>}
              <RichText value={page.story} />
            </div>
            {page.storyImage?.asset && (
              <div className="img"><SanityImage image={page.storyImage} fill sizes="(max-width: 899px) 100vw, 50vw" /></div>
            )}
          </div>
          {isNuku && (
            <div className="stats" style={{ marginTop: 24 }}>
              <div><b className="tabular">{d?.waiting ?? 0}</b><span>{t("adoption.waitingCount")}</span></div>
              <div><b className="tabular">{d?.graduated ?? 0}</b><span>{t("adoption.graduatedCount")}</span></div>
              <div><b className="tabular">{d?.adoption?.since ?? "—"}</b><span>{t("adoption.since")}</span></div>
            </div>
          )}
        </section>
      )}

      {/* 在店裡的時光（FUFU 放在貓咪之前；NUKUNUKU 以等家的貓為主） */}
      {!isNuku && !!page?.spend?.length && <SpendSection title={t("brand.spend")} items={page.spend} />}

      {/* 貓咪 */}
      {showcase.length > 0 && (
        <section className="wrap section">
          <SectionHead
            title={isNuku && d?.waitingCats?.length ? t("adoption.waitingTitle") : t("brand.ourCats", { brand: b.name })}
            href={`/${brand}/cats`}
            linkLabel={t("brand.catsCount", { count: d?.catCount ?? showcase.length })}
          />
          <div className="cat-grid">{showcase.map((c) => <CatCard key={c._id} cat={c} />)}</div>
        </section>
      )}

      {/* NUKUNUKU：認養流程與畢業故事 */}
      {isNuku && (
        <>
          <section className="wrap section">
            <div className="panel-accent stack" style={{ ["--gap" as string]: "18px" }}>
              <h2 style={{ fontSize: 22 }}>{t("adoption.steps")}</h2>
              <Steps steps={d?.adoption?.steps} />
              <div><Link className="btn" href={`/${brand}/adoption`}>{t("adoption.requirements")} →</Link></div>
            </div>
          </section>
          {!!d?.stories?.length && (
            <section className="wrap section">
              <SectionHead title={t("graduates.title")} href={`/${brand}/graduates`} linkLabel={t("common.viewAll")} />
              <div className="stack">
                <StoryCard story={d.stories[0]} feature />
                {d.stories.length > 1 && (
                  <div className="story-grid">{d.stories.slice(1).map((s) => <StoryCard key={s._id} story={s} />)}</div>
                )}
              </div>
            </section>
          )}
          {!!page?.spend?.length && <SpendSection title={t("brand.spend")} items={page.spend} />}
        </>
      )}

      {/* 空間 */}
      {!!page?.space?.length && (
        <section className="section">
          <div className="wrap"><SectionHead title={t("brand.space")} /></div>
          <div className="space-scroller">
            {page.space.map((img, i) => (
              <figure key={img._key ?? i}>
                <div className="img"><SanityImage image={img} fill sizes="(max-width: 767px) 76vw, 420px" /></div>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* 價格與約定（摘要） */}
      {d?.shop && (
        <section className="wrap section stack" style={{ ["--gap" as string]: "20px" }}>
          <SectionHead title={t("visit.price")} />
          <PriceTable shop={d.shop} />
          {!!d.shop.rules?.length && (
            <>
              <h2 style={{ fontSize: 20, marginTop: 12 }}>{t("visit.rules")}</h2>
              <RulesList rules={d.shop.rules.slice(0, 4)} />
            </>
          )}
          <Link className="text-link" href={`/${brand}/visit`}>{t("visit.fullRules")} →</Link>
          <JsonLd data={shopLd(d.shop, locale, page?.hero)} />
        </section>
      )}

      {/* 消息 */}
      {!!d?.news?.length && (
        <section className="wrap section">
          <SectionHead title={t("brand.news", { brand: b.name })} href="/news" linkLabel={t("common.viewAll")} />
          <NewsList items={d.news} />
        </section>
      )}

      <div className="wrap section">
        <Link href={`/${other.id}`} className={`also ${other.id}`}>
          <span>{t("brand.alsoSee", { brand: other.name })}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}

function SpendSection({ title, items }: { title: string; items: Step[] }) {
  return (
    <section className="wrap section">
      <SectionHead title={title} />
      <div className="spend-grid">
        {items.map((s) => (
          <div key={s._key} className="spend-item">
            <div className="img">{s.image?.asset && <SanityImage image={s.image} fill sizes="(max-width: 899px) 50vw, 25vw" />}</div>
            <b>{s.title}</b>
            {s.text && <p>{s.text}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
