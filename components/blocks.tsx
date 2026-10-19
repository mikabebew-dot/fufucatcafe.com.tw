import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CAT_STATUS } from "@/lib/constants";
import type { CatCard as CatCardT, FaqItem, GameCard as GameCardT, Img, NewsCard as NewsCardT, Step, Story } from "@/lib/types";
import { SanityImage } from "./SanityImage";

/* ───────── 版面 ───────── */

export function PageHead({ title, intro, cover }: { title: string; intro?: string | null; cover?: Img }) {
  return (
    <div className="wrap page-head">
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
      {cover?.asset && (
        <div className="page-cover" style={{ marginTop: 24 }}>
          <SanityImage image={cover} fill sizes="(max-width: 1180px) 100vw, 1180px" priority />
        </div>
      )}
    </div>
  );
}

export function Breadcrumb({ href, label }: { href: string; label: string }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      <Link href={href}>← {label}</Link>
    </nav>
  );
}

/** 主要內容尚未翻成目前語言時的提示 */
export function Untranslated({ show }: { show: boolean }) {
  const t = useTranslations("common");
  if (!show) return null;
  return (
    <p className="notice untranslated" role="note">
      {t("untranslated")}
    </p>
  );
}

export function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href && <Link href={href}>{linkLabel} →</Link>}
    </div>
  );
}

/* ───────── 步驟（真實順序） ───────── */

export function Steps({ steps }: { steps?: Step[] }) {
  if (!steps?.length) return null;
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s._key}>
          <span className="num" aria-hidden="true">{i + 1}</span>
          <div>
            <b>{s.title}</b>
            {s.text && <p>{s.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ───────── 貓咪 ───────── */

export function StatusBadge({ status }: { status?: string }) {
  const t = useTranslations("catStatus");
  const s = CAT_STATUS.find((x) => x.value === status);
  if (!s) return null;
  return <span className={`badge ${s.tone}`}>{t(s.value)}</span>;
}

export function CatCard({ cat, showBrand = false, priority = false }: { cat: CatCardT; showBrand?: boolean; priority?: boolean }) {
  return (
    <Link href={`/${cat.brand}/cats/${cat.slug}`} className="cat-card">
      <div className="img">
        <SanityImage image={cat.cover} aspect={4 / 5} sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw" priority={priority} />
        {cat.status !== "resident" && <StatusBadge status={cat.status} />}
      </div>
      <div className="meta">
        <b>{cat.name}</b>
        {showBrand && <span className={`chip ${cat.brand}`}>{cat.brand === "fufu" ? "FUFU" : "NUKUNUKU"}</span>}
        {cat.summary && <p>{cat.summary}</p>}
      </div>
    </Link>
  );
}

/* ───────── 消息 ───────── */

export function NewsMeta({ item }: { item: Pick<NewsCardT, "publishedAt" | "category" | "pinned" | "brand"> }) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <span className="meta">
      {item.pinned && <span className="badge warn">{t("news.pinned")}</span>}
      <time dateTime={item.publishedAt}>{format.dateTime(new Date(item.publishedAt), { year: "numeric", month: "2-digit", day: "2-digit" })}</time>
      {item.category && <span>{t(`news.category.${item.category}` as "news.category.announcement")}</span>}
      {item.brand && <span>{t(`brandScope.${item.brand}` as "brandScope.both")}</span>}
    </span>
  );
}

export function NewsList({ items }: { items?: NewsCardT[] }) {
  if (!items?.length) return null;
  return (
    <ul className="news-list">
      {items.map((n) => (
        <li key={n._id}>
          <Link href={`/news/${n.slug}`}>
            <NewsMeta item={n} />
            <span>{n.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NewsCard({ item }: { item: NewsCardT }) {
  return (
    <Link href={`/news/${item.slug}`} className="news-card">
      <div className="img">{item.cover?.asset && <SanityImage image={item.cover} fill sizes="(max-width: 699px) 100vw, 33vw" />}</div>
      <div className="body">
        <NewsMeta item={item} />
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
      </div>
    </Link>
  );
}

/* ───────── 常見問題 ───────── */

export function FaqList({ faqs }: { faqs?: FaqItem[] }) {
  if (!faqs?.length) return null;
  return (
    <div className="faq-list">
      {faqs.map((f) => (
        <details key={f._id}>
          <summary>{f.question}</summary>
          <p className="answer">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/* ───────── 遊戲 ───────── */

export function GameCard({ game }: { game: GameCardT }) {
  const t = useTranslations();
  return (
    <Link href={`/playroom/${game.slug}`} className="game-card">
      <div className="img">
        {game.cover?.asset && <SanityImage image={game.cover} fill sizes="(max-width: 699px) 100vw, 33vw" />}
        {!game.url && <span className="badge muted" style={{ position: "absolute", top: 10, left: 10 }}>{t("playroom.comingSoon")}</span>}
      </div>
      <div className="body">
        <h3>{game.title}</h3>
        {game.summary && <p className="muted small">{game.summary}</p>}
        {!!game.platforms?.length && (
          <p className="small muted">{game.platforms.map((p) => t(`platform.${p}` as "platform.web")).join("・")}</p>
        )}
      </div>
    </Link>
  );
}

/* ───────── 畢業故事 ───────── */

export function StoryCard({ story, feature = false }: { story: Story; feature?: boolean }) {
  const t = useTranslations("graduates");
  const format = useFormatter();
  const title = story.title || t("newLife", { name: story.catName ?? "" });
  const date = format.dateTime(new Date(story.graduatedAt), { year: "numeric", month: "2-digit" });
  if (feature) {
    return (
      <Link href={`/nukunuku/graduates/${story.slug}`} className="story-feature">
        <div className="img">{story.image?.asset && <SanityImage image={story.image} fill sizes="(max-width: 899px) 100vw, 50vw" />}</div>
        <div className="body">
          <span className="small muted">{t("graduatedOn", { date })}</span>
          <h3>{title}</h3>
          {story.familyWords && <p className="muted">{story.familyWords}</p>}
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/nukunuku/graduates/${story.slug}`} className="story-card">
      <div className="img">{story.image?.asset && <SanityImage image={story.image} fill sizes="(max-width: 899px) 50vw, 33vw" />}</div>
      <p>{title}</p>
      <span className="small muted">{t("graduatedOn", { date })}</span>
    </Link>
  );
}
