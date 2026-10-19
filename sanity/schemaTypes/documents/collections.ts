import { DocumentTextIcon, HeartIcon, HelpCircleIcon, PlayIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { ADOPTION_BRAND, BRANDS, BRAND_SCOPE, CAT_STATUS, FAQ_CATEGORIES, NEWS_CATEGORIES, PLATFORMS } from "@/lib/constants";
import { missingLangs, requireZh } from "../objects/localized";

/** 非 NUKUNUKU 的貓隱藏認養欄位 */
const isNuku = ({ document }: { document?: Record<string, unknown> }) => document?.brand !== ADOPTION_BRAND;
const slugField = (source: string, example: string) =>
  defineField({
    name: "slug",
    title: "網址代稱",
    type: "slug",
    description: `網址的一部分，建議用英文或拼音，例如 ${example}。按「Generate」自動產生。發布後請勿任意更改，以免舊連結失效。`,
    options: { source, maxLength: 60, slugify: (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60) },
    validation: (r) => r.required().error("請填寫網址代稱（英文、數字、連字號）"),
  });

const seoField = (group?: string) => defineField({ name: "seo", title: "SEO 與分享設定", type: "seo", ...(group ? { group } : {}) });

export const cat = defineType({
  name: "cat",
  title: "貓咪",
  type: "document",
  icon: () => "🐈",
  groups: [
    { name: "basic", title: "基本資料", default: true },
    { name: "photos", title: "照片" },
    { name: "story", title: "介紹" },
    { name: "adoption", title: "認養資訊", hidden: isNuku },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "name", title: "名字", type: "l10nString", group: "basic", validation: requireZh }),
    slugField("name.en", "mochi"),
    defineField({
      name: "brand",
      title: "所在店",
      type: "string",
      group: "basic",
      options: { list: BRANDS.map((b) => ({ value: b.id, title: b.name })), layout: "radio", direction: "horizontal" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "狀態",
      type: "string",
      group: "basic",
      description: "可認養、媒合中、已畢業只適用 NUKUNUKU。",
      options: { list: CAT_STATUS.map(({ value, title }) => ({ value, title })), layout: "radio" },
      initialValue: "resident",
      validation: (r) =>
        r.required().custom((status: string | undefined, ctx) => {
          const brand = (ctx.document as { brand?: string } | undefined)?.brand;
          const s = CAT_STATUS.find((x) => x.value === status);
          if (s && brand && !(s.brands as readonly string[]).includes(brand)) return `「${s.title}」只適用 NUKUNUKU`;
          return true;
        }),
    }),
    defineField({
      name: "gender",
      title: "性別",
      type: "string",
      group: "basic",
      options: { list: [{ value: "male", title: "男生" }, { value: "female", title: "女生" }, { value: "unknown", title: "未確認" }], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "birthday", title: "生日（不確定可填推估日期）", type: "date", group: "basic" }),
    defineField({ name: "breed", title: "品種", type: "l10nString", group: "basic" }),
    defineField({ name: "color", title: "毛色", type: "l10nString", group: "basic" }),
    defineField({ name: "traits", title: "個性標籤", type: "l10nTags", group: "basic", description: "輸入後按 Enter，例如：親人、愛吃、怕生" }),
    defineField({ name: "featured", title: "首頁精選", type: "boolean", group: "basic", initialValue: false }),
    defineField({ name: "order", title: "排序", type: "number", group: "basic", description: "數字小的排前面；留空排在最後。" }),
    defineField({ name: "cover", title: "代表照片", type: "imageWithAlt", group: "photos", validation: (r) => r.required().error("請上傳代表照片") }),
    defineField({ name: "photos", title: "更多照片", type: "array", group: "photos", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({ name: "summary", title: "一句話介紹", type: "l10nString", group: "story" }),
    defineField({ name: "story", title: "詳細介紹", type: "l10nRichText", group: "story" }),
    // NUKUNUKU 專用
    defineField({ name: "arrivedAt", title: "到店日期", type: "date", group: "adoption", hidden: isNuku }),
    defineField({ name: "neutered", title: "已結紮", type: "boolean", group: "adoption", hidden: isNuku }),
    defineField({ name: "vaccinated", title: "已施打疫苗", type: "boolean", group: "adoption", hidden: isNuku }),
    defineField({ name: "healthNote", title: "健康備註", type: "l10nText", group: "adoption", hidden: isNuku }),
    defineField({ name: "adoptionNote", title: "這隻貓的認養條件", type: "l10nText", group: "adoption", hidden: isNuku, description: "例如：需與其他貓同住、適合有經驗的家庭。" }),
    defineField({ name: "graduatedAt", title: "畢業日期", type: "date", group: "adoption", hidden: ({ document }) => document?.status !== "graduated" }),
    seoField("seo"),
  ],
  orderings: [
    { title: "排序", name: "order", by: [{ field: "order", direction: "asc" }, { field: "name.zh", direction: "asc" }] },
    { title: "名字", name: "name", by: [{ field: "name.zh", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.zh", brand: "brand", status: "status", media: "cover", en: "name.en", ja: "name.ja", ko: "name.ko" },
    prepare: ({ title, brand, status, media, en, ja, ko }) => ({
      title,
      subtitle: [BRANDS.find((b) => b.id === brand)?.name, CAT_STATUS.find((s) => s.value === status)?.title, missingLangs({ en, ja, ko })].filter(Boolean).join("・"),
      media,
    }),
  },
});

export const graduateStory = defineType({
  name: "graduateStory",
  title: "畢業故事",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", description: "留空則自動顯示「○○ 的新生活」。" }),
    defineField({
      name: "cat",
      title: "貓咪",
      type: "reference",
      to: [{ type: "cat" }],
      options: { filter: 'brand == "nukunuku"' },
      validation: (r) => r.required(),
    }),
    slugField("graduatedAt", "mochi-2026"),
    defineField({ name: "graduatedAt", title: "畢業日期", type: "date", validation: (r) => r.required() }),
    defineField({ name: "photos", title: "新家照片", type: "array", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" } }),
    defineField({
      name: "consent",
      title: "家人已同意公開照片與文字",
      type: "boolean",
      initialValue: false,
      validation: (r) => r.custom((v?: boolean) => (v ? true : "需取得家人同意才能發布")),
    }),
    defineField({ name: "familyWords", title: "家人的話", type: "l10nText" }),
    defineField({ name: "body", title: "內文", type: "l10nRichText" }),
    seoField(),
  ],
  orderings: [{ title: "畢業日期（新→舊）", name: "date", by: [{ field: "graduatedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title.zh", cat: "cat.name.zh", date: "graduatedAt", media: "photos.0", consent: "consent" },
    prepare: ({ title, cat, date, media, consent }) => ({
      title: title || `${cat ?? "？"} 的新生活`,
      subtitle: [date, consent ? "" : "尚未取得同意"].filter(Boolean).join("・"),
      media,
    }),
  },
});

export const game = defineType({
  name: "game",
  title: "遊戲",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({ name: "title", title: "遊戲名稱", type: "l10nString", validation: requireZh }),
    slugField("title.en", "cat-catch"),
    defineField({ name: "cover", title: "封面", type: "imageWithAlt", description: "建議橫式 16:9。" }),
    defineField({ name: "summary", title: "簡介", type: "l10nText" }),
    defineField({ name: "howTo", title: "玩法說明", type: "l10nRichText" }),
    defineField({
      name: "url",
      title: "遊戲網址（選填）",
      type: "url",
      description: "還沒有網址可以先留空，官網會顯示「即將推出」；填入後自動變成可點擊。",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "platforms", title: "平台", type: "array", of: [{ type: "string" }], options: { list: PLATFORMS.map(({ value, title }) => ({ value, title })) } }),
    defineField({ name: "cats", title: "登場貓咪", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "cat" }] })] }),
    defineField({ name: "order", title: "排序", type: "number" }),
    seoField(),
  ],
  orderings: [{ title: "排序", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title.zh", url: "url", media: "cover" },
    prepare: ({ title, url, media }) => ({ title, subtitle: url || "即將推出（未填網址）", media }),
  },
});

/** 發布＝上架；右下角 ⋯ →「取消發布」＝下架（內容保留可再上架） */
export const news = defineType({
  name: "news",
  title: "最新消息",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "內容", default: true },
    { name: "event", title: "活動資訊" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", group: "content", validation: requireZh }),
    slugField("title.en", "2026-halloween"),
    defineField({ name: "publishedAt", title: "日期", type: "datetime", group: "content", initialValue: () => new Date().toISOString(), validation: (r) => r.required() }),
    defineField({ name: "category", title: "分類", type: "string", group: "content", options: { list: NEWS_CATEGORIES.map(({ value, title }) => ({ value, title })), layout: "radio", direction: "horizontal" }, initialValue: "announcement" }),
    defineField({ name: "brand", title: "所屬", type: "string", group: "content", options: { list: BRAND_SCOPE.map(({ value, title }) => ({ value, title })), layout: "radio", direction: "horizontal" }, initialValue: "both" }),
    defineField({ name: "pinned", title: "置頂", type: "boolean", group: "content", initialValue: false }),
    defineField({ name: "cover", title: "封面照片", type: "imageWithAlt", group: "content" }),
    defineField({ name: "excerpt", title: "摘要", type: "l10nText", group: "content", description: "列表與搜尋結果使用，建議 80 字以內。" }),
    defineField({ name: "body", title: "內文", type: "l10nRichText", group: "content" }),
    defineField({ name: "eventStart", title: "活動開始", type: "datetime", group: "event", description: "填寫後，搜尋引擎會將這則消息辨識為活動。" }),
    defineField({ name: "eventEnd", title: "活動結束", type: "datetime", group: "event" }),
    seoField("seo"),
  ],
  orderings: [{ title: "日期（新→舊）", name: "date", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title.zh", date: "publishedAt", category: "category", media: "cover", en: "title.en", ja: "title.ja", ko: "title.ko" },
    prepare: ({ title, date, category, media, en, ja, ko }) => ({
      title,
      subtitle: [date?.slice(0, 10), NEWS_CATEGORIES.find((c) => c.value === category)?.title, missingLangs({ en, ja, ko })].filter(Boolean).join("・"),
      media,
    }),
  },
});

export const faq = defineType({
  name: "faq",
  title: "常見問題",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: "question", title: "問題", type: "l10nString", validation: requireZh }),
    defineField({ name: "answer", title: "答案", type: "l10nText", validation: requireZh }),
    defineField({ name: "category", title: "分類", type: "string", options: { list: FAQ_CATEGORIES.map(({ value, title }) => ({ value, title })), layout: "radio", direction: "horizontal" }, initialValue: "visit" }),
    defineField({ name: "brand", title: "適用", type: "string", options: { list: BRAND_SCOPE.map(({ value, title }) => ({ value, title })), layout: "radio", direction: "horizontal" }, initialValue: "both" }),
    defineField({ name: "onHome", title: "顯示在首頁", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "排序", type: "number" }),
  ],
  orderings: [{ title: "排序", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "question.zh", category: "category", en: "question.en", ja: "question.ja", ko: "question.ko" },
    prepare: ({ title, category, en, ja, ko }) => ({
      title,
      subtitle: [FAQ_CATEGORIES.find((c) => c.value === category)?.title, missingLangs({ en, ja, ko })].join("・"),
    }),
  },
});
