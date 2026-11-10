import "server-only";
import type { BrandId } from "@/lib/constants";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { DEFAULTS, LANGS, PRICE_PER_10, type L10n, type Lang } from "./content";

/** 入場頁需要的資料：全部語言一次給前端，切換語言不必重新載入 */
export type CheckinCat = {
  slug: string;
  status: string;
  name: L10n;
  summary: L10n | null;
  traits: Record<Lang, string[]> | null;
  photo: string | null;
};
export type CheckinData = {
  brand: BrandId;
  per10: number;
  shortDrinks: L10n;
  longMin: number;
  entryNote: L10n | null;
  cats: CheckinCat[];
};

type Raw = {
  shop: {
    per10?: number;
    entryNote?: Partial<L10n> | null;
    checkinShortDrinks?: Partial<L10n> | null;
    checkinLongMin?: number | null;
  } | null;
  cats: { slug?: string; status: string; name?: Partial<L10n>; summary?: Partial<L10n> | null; traits?: Partial<Record<Lang, string[]>> | null; cover?: { asset?: unknown } | null }[];
};

const fill = (v: Partial<L10n> | null | undefined, fallback?: L10n): L10n | null => {
  if (!v?.zh && !fallback) return null;
  const base = v?.zh ? v : fallback!;
  return Object.fromEntries(LANGS.map((l) => [l, (v?.[l] || base[l] || base.zh || "") as string])) as L10n;
};

export async function loadCheckin(brand: BrandId): Promise<CheckinData> {
  // NUKUNUKU：可認養與媒合中的中途貓；FUFU：自己的店貓（有照片的才顯示）
  const statuses = brand === "nukunuku" ? ["adoptable", "matching"] : ["resident"];
  // 後台暫時連不上時，入場頁仍用預設值正常運作（不顯示貓咪清單）
  const raw = await client.fetch<Raw>(
    `{
      "shop": *[_type == "shopInfo" && _id == $shopId][0]{
        "per10": prices[0].weekday, entryNote, checkinShortDrinks, checkinLongMin
      },
      "cats": *[_type == "cat" && brand == $brand && status in $statuses && defined(slug.current) && defined(cover.asset)]
        | order(coalesce(order, 9999) asc, _createdAt asc)[0...40]{
          "slug": slug.current, status, name, summary, traits, cover
        }
    }`,
    { shopId: `shop-${brand}`, brand, statuses },
    { stega: false, next: { revalidate: 60 } },
  ).catch((e) => {
    console.error("[checkin] 後台讀取失敗，改用預設值", e);
    return { shop: null, cats: [] } as Raw;
  });
  const d = DEFAULTS[brand];
  return {
    brand,
    per10: raw.shop?.per10 || PRICE_PER_10,
    shortDrinks: fill(raw.shop?.checkinShortDrinks, d.shortDrinks)!,
    longMin: raw.shop?.checkinLongMin || d.longMin,
    entryNote: fill(raw.shop?.entryNote),
    cats: (raw.cats ?? [])
      .filter((c) => c.slug && c.name?.zh)
      .map((c) => ({
        slug: c.slug!,
        status: c.status,
        name: fill(c.name)!,
        summary: fill(c.summary),
        traits: c.traits?.zh ? (Object.fromEntries(LANGS.map((l) => [l, c.traits?.[l]?.length ? c.traits[l] : c.traits!.zh])) as Record<Lang, string[]>) : null,
        photo: c.cover?.asset ? urlFor(c.cover as never).width(360).height(360).fit("crop").url() : null,
      })),
  };
}
