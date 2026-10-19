import { defineArrayMember, defineField, defineType } from "sanity";
import { requireZh } from "./localized";

/**
 * 全站共用照片欄位
 * - 焦點與裁切：拖曳圓圈標出主角，手機與電腦裁切都會保留
 * - 替代文字：中文必填（或勾「純裝飾」），其他語言選填
 * - 上傳原圖即可，官網依裝置自動取得適當尺寸並轉 WebP/AVIF
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "照片",
  type: "image",
  options: { hotspot: true, metadata: ["lqip", "palette"] },
  fields: [
    defineField({
      name: "alt",
      title: "替代文字（ALT）",
      type: "l10nString",
      description: "描述照片內容，例如「薄荷色沙發上睡覺的無毛貓」。視障者與搜尋引擎會讀取。",
      validation: (rule) =>
        rule.custom((alt: { zh?: string } | undefined, ctx) => {
          const parent = ctx.parent as { decorative?: boolean; asset?: unknown } | undefined;
          if (!parent?.asset || parent.decorative) return true;
          return alt?.zh?.trim() ? true : "建議填寫中文替代文字（對搜尋引擎與視障者有幫助）；不填也可以發布";
        }).warning(),
    }),
    defineField({ name: "decorative", title: "純裝飾圖片（不需替代文字）", type: "boolean", initialValue: false }),
    defineField({ name: "caption", title: "圖說（選填）", type: "l10nString" }),
    defineField({ name: "credit", title: "攝影／來源（選填）", type: "string" }),
  ],
});

/** 可插入照片的內文 */
export const richText = defineType({
  name: "richText",
  title: "內文",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "內文", value: "normal" },
        { title: "小標題", value: "h2" },
        { title: "次標題", value: "h3" },
        { title: "引言", value: "blockquote" },
      ],
      lists: [
        { title: "項目符號", value: "bullet" },
        { title: "編號", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "粗體", value: "strong" },
          { title: "斜體", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "連結",
            fields: [
              {
                name: "href",
                type: "url",
                title: "網址",
                validation: (rule) => rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({ type: "imageWithAlt" }),
  ],
});

/** 每頁的 SEO 與分享設定；留空時自動使用頁面內容或網站預設值 */
export const seo = defineType({
  name: "seo",
  title: "SEO 與分享設定",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "SEO 標題",
      type: "l10nString",
      description: "搜尋結果與瀏覽器分頁顯示的標題。建議中文 30 字、英文 60 字以內。留空則使用頁面標題。",
      validation: (rule) =>
        rule.custom((v: { zh?: string; en?: string } | undefined) =>
          (v?.zh?.length ?? 0) > 35 || (v?.en?.length ?? 0) > 65 ? "標題太長，搜尋結果可能被截斷" : true,
        ).warning(),
    }),
    defineField({
      name: "description",
      title: "SEO 描述",
      type: "l10nText",
      description: "搜尋結果標題下方的說明。建議中文 80 字、英文 160 字以內。",
      validation: (rule) =>
        rule.custom((v: { zh?: string; en?: string } | undefined) =>
          (v?.zh?.length ?? 0) > 90 || (v?.en?.length ?? 0) > 170 ? "描述太長，搜尋結果可能被截斷" : true,
        ).warning(),
    }),
    defineField({
      name: "ogImage",
      title: "分享圖片",
      type: "image",
      description: "分享到 LINE、Facebook 時的預覽圖，會自動裁成 1200×630。留空則使用頁面主圖。",
      options: { hotspot: true },
    }),
    defineField({ name: "noIndex", title: "不讓搜尋引擎收錄此頁", type: "boolean", initialValue: false }),
  ],
});

export const heroSlide = defineType({
  name: "heroSlide",
  title: "主視覺",
  type: "object",
  fields: [
    defineField({ name: "image", title: "照片", type: "imageWithAlt", validation: (r) => r.required().error("這張主視覺還沒有照片：請上傳照片，或用右邊 ⋯ →「移除」刪掉這一項") }),
    defineField({ name: "mobileImage", title: "手機版直式照片（選填）", type: "imageWithAlt", description: "留空則使用上方照片並依焦點裁切。" }),
    defineField({ name: "heading", title: "標題（選填）", type: "l10nString" }),
    defineField({ name: "subheading", title: "副標（選填）", type: "l10nString" }),
    defineField({
      name: "link",
      title: "點擊照片要前往的網址（選填）",
      type: "string",
      description: "不是按鈕文字。站內頁面填網址路徑，例如 /fufu 或 /nukunuku；外部網站填完整 https://…；不需要就留空。",
      validation: (r) => r.custom((v?: string) => (!v || v.startsWith("/") || /^https:\/\//.test(v) ? true : "請以 / 或 https:// 開頭")),
    }),
    defineField({ name: "hidden", title: "暫時隱藏", type: "boolean", initialValue: false }),
  ],
  preview: {
    select: { media: "image", title: "heading.zh", alt: "image.alt.zh", hidden: "hidden" },
    prepare: ({ media, title, alt, hidden }) => ({ media, title: `${hidden ? "【隱藏】" : ""}${title || alt || "（未命名主視覺）"}` }),
  },
});

/** 有照片、標題、說明的小卡（度過方式、來店步驟、認養步驟共用） */
export const step = defineType({
  name: "step",
  title: "項目",
  type: "object",
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", validation: requireZh }),
    defineField({ name: "text", title: "說明", type: "l10nText" }),
    defineField({ name: "image", title: "照片（選填）", type: "imageWithAlt" }),
  ],
  preview: { select: { title: "title.zh", subtitle: "text.zh", media: "image" } },
});

export const footerLink = defineType({
  name: "footerLink",
  title: "頁尾連結",
  type: "object",
  fields: [
    defineField({
      name: "category",
      title: "分類",
      type: "string",
      options: { list: [{ value: "store", title: "線上商店" }, { value: "partner", title: "合作店家" }], layout: "radio", direction: "horizontal" },
      initialValue: "partner",
      validation: (r) => r.required(),
    }),
    defineField({ name: "name", title: "名稱", type: "l10nString", validation: requireZh }),
    defineField({ name: "url", title: "網址", type: "url", validation: (r) => r.required().uri({ scheme: ["https", "http"] }) }),
  ],
  preview: {
    select: { title: "name.zh", category: "category", url: "url" },
    prepare: ({ title, category, url }) => ({ title, subtitle: `${category === "store" ? "線上商店" : "合作店家"}・${url ?? ""}` }),
  },
});

export const socialLink = defineType({
  name: "socialLink",
  title: "社群連結",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "平台",
      type: "string",
      options: { list: ["Instagram", "Facebook", "LINE", "Threads", "YouTube", "TikTok", "Google Maps"] },
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", title: "網址", type: "url", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});
