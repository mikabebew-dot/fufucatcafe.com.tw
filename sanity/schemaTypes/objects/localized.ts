import { defineField, defineType, type Rule } from "sanity";

/**
 * 四語欄位：繁體中文直接顯示，英日韓收在「其他語言」裡（預設收合）。
 * 官網會依語言取值；某語言沒填時自動顯示中文，並在頁面標示「尚未翻譯」。
 */
export const LANGS = [
  { id: "zh", title: "繁體中文" },
  { id: "en", title: "English" },
  { id: "ja", title: "日本語" },
  { id: "ko", title: "한국어" },
] as const;
export type LangKey = (typeof LANGS)[number]["id"];

function localized(name: string, title: string, type: string, extra: Record<string, unknown> = {}) {
  return defineType({
    name,
    title,
    type: "object",
    fieldsets: [
      { name: "translations", title: "其他語言（English・日本語・한국어）", options: { collapsible: true, collapsed: true } },
    ],
    fields: LANGS.map((l) =>
      defineField({
        name: l.id,
        title: l.title,
        type,
        fieldset: l.id === "zh" ? undefined : "translations",
        ...extra,
      }),
    ),
  });
}

export const l10nString = localized("l10nString", "文字", "string");
export const l10nText = localized("l10nText", "段落", "text", { rows: 3 });
export const l10nRichText = localized("l10nRichText", "內文", "richText");

/** 個性標籤：每種語言一組標籤 */
export const l10nTags = defineType({
  name: "l10nTags",
  title: "標籤",
  type: "object",
  fieldsets: [
    { name: "translations", title: "其他語言（English・日本語・한국어）", options: { collapsible: true, collapsed: true } },
  ],
  fields: LANGS.map((l) =>
    defineField({
      name: l.id,
      title: l.title,
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      fieldset: l.id === "zh" ? undefined : "translations",
    }),
  ),
});

/** 規則：中文必填 */
export const requireZh = (rule: Rule) =>
  rule.custom((value: { zh?: unknown } | undefined) => {
    const zh = value?.zh;
    const empty = zh == null || (typeof zh === "string" && !zh.trim()) || (Array.isArray(zh) && zh.length === 0);
    return empty ? "請填寫繁體中文" : true;
  });

/** 後台列表顯示「缺哪些語言」 */
export function missingLangs(v: { en?: unknown; ja?: unknown; ko?: unknown } | undefined) {
  const miss = (["en", "ja", "ko"] as const).filter((k) => {
    const x = v?.[k];
    return x == null || (typeof x === "string" && !x.trim()) || (Array.isArray(x) && x.length === 0);
  });
  return miss.length ? `缺 ${miss.map((m) => m.toUpperCase()).join("・")}` : "四語齊全";
}
