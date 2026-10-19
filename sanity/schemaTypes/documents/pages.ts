import { CogIcon, DocumentIcon, HomeIcon, ThListIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { requireZh } from "../objects/localized";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "網站設定",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "一般", default: true },
    { name: "notice", title: "公告列" },
    { name: "links", title: "連結" },
    { name: "seo", title: "預設 SEO" },
  ],
  fields: [
    defineField({ name: "siteName", title: "網站名稱", type: "string", group: "general", initialValue: "FUFU × NUKUNUKU", validation: (r) => r.required() }),
    defineField({
      name: "announcement",
      title: "全站公告列",
      type: "object",
      group: "notice",
      description: "臨時公休、颱風停業等緊急訊息。開啟後顯示在每一頁最上方。",
      fields: [
        defineField({ name: "enabled", title: "顯示公告", type: "boolean", initialValue: false }),
        defineField({ name: "text", title: "公告文字", type: "l10nString" }),
        defineField({ name: "link", title: "連結（選填）", type: "string", description: "站內填 /news/…，外部填 https://…" }),
        defineField({ name: "until", title: "自動下架時間（選填）", type: "datetime", description: "到這個時間後自動隱藏，不必記得關。" }),
      ],
    }),
    defineField({ name: "socials", title: "社群連結", type: "array", group: "links", of: [defineArrayMember({ type: "socialLink" })] }),
    defineField({
      name: "footerLinks",
      title: "頁尾連結（線上商店、合作店家）",
      type: "array",
      group: "links",
      description: "拖曳排序。官網頁尾依分類顯示，點擊開新分頁。",
      of: [defineArrayMember({ type: "footerLink" })],
    }),
    defineField({ name: "defaultSeo", title: "預設 SEO", type: "seo", group: "seo", options: { collapsed: false } }),
  ],
  preview: { prepare: () => ({ title: "網站設定" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "首頁",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "主視覺", default: true },
    { name: "content", title: "內容" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroSlides",
      title: "主視覺照片",
      type: "array",
      group: "hero",
      description: "拖曳左側把手排序；第一張最先顯示。建議 3–5 張。",
      of: [defineArrayMember({ type: "heroSlide" })],
      validation: (r) => r.max(8).warning("太多張會拖慢首頁"),
    }),
    defineField({ name: "headline", title: "主標", type: "l10nString", group: "content", validation: requireZh }),
    defineField({ name: "subheadline", title: "副標", type: "l10nText", group: "content" }),
    defineField({ name: "aboutTitle", title: "理念摘要標題", type: "l10nString", group: "content" }),
    defineField({ name: "aboutSummary", title: "理念摘要", type: "l10nText", group: "content", description: "約 80–120 字，連到品牌理念頁。" }),
    defineField({
      name: "playroomGame",
      title: "首頁遊樂室小卡",
      type: "reference",
      to: [{ type: "game" }],
      group: "content",
      description: "選一個遊戲顯示在首頁；留空則不顯示。",
    }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "首頁" }) },
});

/** 品牌理念、隱私權政策 */
export const contentPage = defineType({
  name: "contentPage",
  title: "內容頁",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", validation: requireZh }),
    defineField({ name: "intro", title: "導言", type: "l10nText" }),
    defineField({ name: "cover", title: "主圖", type: "imageWithAlt" }),
    defineField({ name: "body", title: "內文", type: "l10nRichText" }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo" }),
  ],
  preview: { select: { title: "title.zh", media: "cover" } },
});

export const firstVisitGuide = defineType({
  name: "firstVisitGuide",
  title: "第一次來店指南",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", validation: requireZh }),
    defineField({ name: "intro", title: "導言", type: "l10nText" }),
    defineField({
      name: "steps",
      title: "來店步驟",
      type: "array",
      description: "依實際順序排列；首頁會顯示前三步。",
      of: [defineArrayMember({ type: "step" })],
    }),
    defineField({
      name: "differences",
      title: "兩店差異",
      type: "array",
      description: "例如入場年齡、餵食時間。",
      of: [
        defineArrayMember({
          type: "object",
          name: "difference",
          fields: [
            defineField({ name: "topic", title: "項目", type: "l10nString", validation: requireZh }),
            defineField({ name: "fufu", title: "FUFU", type: "l10nString" }),
            defineField({ name: "nukunuku", title: "NUKUNUKU", type: "l10nString" }),
          ],
          preview: { select: { title: "topic.zh", subtitle: "fufu.zh" } },
        }),
      ],
    }),
    defineField({ name: "notes", title: "注意事項", type: "l10nRichText" }),
    defineField({ name: "faqs", title: "相關常見問題", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })] }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "第一次來店指南" }) },
});

export const adoptionGuide = defineType({
  name: "adoptionGuide",
  title: "認養說明",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({ name: "title", title: "標題", type: "l10nString", validation: requireZh }),
    defineField({ name: "intro", title: "中途理念", type: "l10nRichText" }),
    defineField({ name: "since", title: "開始中途年份", type: "number" }),
    defineField({ name: "steps", title: "認養流程", type: "array", description: "依實際順序排列。", of: [defineArrayMember({ type: "step" })] }),
    defineField({ name: "requirements", title: "認養條件", type: "l10nRichText" }),
    defineField({ name: "fees", title: "費用說明", type: "l10nRichText" }),
    defineField({ name: "applyUrl", title: "申請表網址", type: "url", description: "例如 Google 表單。留空則顯示「申請表準備中」。" }),
    defineField({ name: "faqs", title: "相關常見問題", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "faq" }] })] }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "認養說明" }) },
});

/** 列表頁的標題、說明、SEO */
export const listingPage = defineType({
  name: "listingPage",
  title: "列表頁設定",
  type: "document",
  icon: ThListIcon,
  fields: [
    defineField({ name: "title", title: "頁面標題", type: "l10nString", validation: requireZh }),
    defineField({ name: "intro", title: "頁面說明", type: "l10nText" }),
    defineField({ name: "cover", title: "頁首照片（選填）", type: "imageWithAlt" }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo" }),
  ],
  preview: { select: { title: "title.zh" }, prepare: ({ title }) => ({ title, subtitle: "列表頁設定" }) },
});
