import { PortableText, type PortableTextComponents } from "next-sanity";
import type { Img } from "@/lib/types";
import { SanityImage } from "./SanityImage";

const components: PortableTextComponents = {
  types: {
    imageWithAlt: ({ value }: { value: NonNullable<Img> }) => (
      <figure>
        <div className="img">
          <SanityImage image={value} sizes="(max-width: 760px) 100vw, 720px" />
        </div>
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

/** 後台「內文」欄位的顯示：段落、標題、清單、連結、插圖 */
export function RichText({ value, className = "rich" }: { value: unknown; className?: string }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
