import { PageHead, Untranslated } from "./blocks";
import { RichText } from "./RichText";
import type { Img } from "@/lib/types";

export type ContentDoc = { title?: string; intro?: string; body?: unknown; cover?: Img; translated?: boolean } | null;

/** 品牌理念、隱私權政策共用版型 */
export function ContentPage({ doc, fallbackTitle }: { doc: ContentDoc; fallbackTitle: string }) {
  return (
    <>
      <PageHead title={doc?.title || fallbackTitle} intro={doc?.intro} cover={doc?.cover} />
      <div className="wrap">
        <Untranslated show={doc?.translated === false} />
        <div className="section" style={{ paddingTop: 8 }}><RichText value={doc?.body} /></div>
      </div>
    </>
  );
}
