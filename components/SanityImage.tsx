"use client";

import Image, { type ImageLoader } from "next/image";
import type { Img } from "@/lib/types";
import { urlFor, type SanityImageSource } from "@/sanity/lib/image";

type Props = {
  image: Img | undefined;
  /** 想呈現的長寬比（寬/高），例如 4/5。不填則依原圖比例。 */
  aspect?: number;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
};

/**
 * 顯示後台上傳的照片：瀏覽器依螢幕大小要求寬度 → Sanity 圖片 CDN 即時產生，
 * 自動轉 WebP/AVIF，並套用後台設定的裁切與焦點。
 */
export function SanityImage({ image, aspect, sizes, priority, fill, className }: Props) {
  if (!image?.asset) return null;
  const src = image as unknown as SanityImageSource;

  const loader: ImageLoader = ({ width, quality }) => {
    let b = urlFor(src).width(width).quality(quality ?? 80);
    if (aspect) b = b.height(Math.round(width / aspect)).fit("crop");
    return b.url();
  };

  const width = image.dimensions?.width ?? 1600;
  const height = aspect ? Math.round(width / aspect) : (image.dimensions?.height ?? 1000);
  const common = {
    loader,
    src: urlFor(src).width(Math.min(width, 2400)).url(),
    alt: image.decorative ? "" : (image.alt ?? ""),
    sizes,
    priority,
    className,
    placeholder: image.lqip ? ("blur" as const) : ("empty" as const),
    blurDataURL: image.lqip,
  };

  return fill ? <Image {...common} fill style={{ objectFit: "cover" }} /> : <Image {...common} width={width} height={height} />;
}
