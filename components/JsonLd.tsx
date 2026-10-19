/** 結構化資料：給搜尋引擎與 AI 讀的頁面事實 */
export function JsonLd({ data }: { data: unknown }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!list.length) return null;
  const json = JSON.stringify(list.length === 1 ? list[0] : list).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
