import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });
export type SanityImageSource = Parameters<typeof builder.image>[0];

/** 依原圖產生任意尺寸的網址；會自動套用後台設定的裁切與焦點 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}

/** 社群分享圖：固定 1200×630 */
export function ogImageUrl(source: SanityImageSource | null | undefined) {
  if (!source || !(source as { asset?: unknown }).asset) return undefined;
  return builder.image(source).width(1200).height(630).fit("crop").auto("format").url();
}
