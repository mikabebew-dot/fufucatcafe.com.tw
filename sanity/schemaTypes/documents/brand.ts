import { PinIcon, TagIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { BRANDS, DAYS, PAYMENTS, RULE_ICONS } from "@/lib/constants";
import { requireZh } from "../objects/localized";

/**
 * 品牌頁（固定 ID：brand-fufu、brand-nukunuku）
 * 品牌色與字體寫在程式中，不開放修改，以保護兩個品牌各自的識別。
 */
export const brand = defineType({
  name: "brand",
  title: "品牌頁",
  type: "document",
  icon: TagIcon,
  groups: [
    { name: "intro", title: "介紹", default: true },
    { name: "photos", title: "照片" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "brand", title: "品牌", type: "string", readOnly: true, hidden: true, options: { list: BRANDS.map((b) => ({ value: b.id, title: b.name })) } }),
    defineField({ name: "headline", title: "主標", type: "l10nString", group: "intro", validation: requireZh }),
    defineField({ name: "subheadline", title: "副標", type: "l10nString", group: "intro" }),
    defineField({ name: "tagline", title: "一句話理念（首頁品牌卡片用）", type: "l10nString", group: "intro" }),
    defineField({ name: "storyTitle", title: "理念標題", type: "l10nString", group: "intro" }),
    defineField({ name: "story", title: "理念內文", type: "l10nRichText", group: "intro" }),
    defineField({
      name: "spend",
      title: "在店裡的時光",
      type: "array",
      group: "intro",
      description: "例如：和貓咪玩、喝飲料、看書工作、餵食時間。建議 4 項。",
      of: [defineArrayMember({ type: "step" })],
    }),
    defineField({ name: "hero", title: "主視覺照片", type: "imageWithAlt", group: "photos", validation: (r) => r.required().error("請上傳主視覺") }),
    defineField({ name: "cardImage", title: "首頁品牌卡片照片", type: "imageWithAlt", group: "photos", description: "留空則使用主視覺。" }),
    defineField({ name: "storyImage", title: "理念段落照片", type: "imageWithAlt", group: "photos" }),
    defineField({
      name: "space",
      title: "空間照片",
      type: "array",
      group: "photos",
      description: "可一次拖入多張；拖曳排序。",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      options: { layout: "grid" },
    }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { brand: "brand", media: "hero" },
    prepare: ({ brand, media }) => ({ title: `${BRANDS.find((b) => b.id === brand)?.name ?? ""} 品牌頁`, media }),
  },
});

/**
 * 來店資訊（固定 ID：shop-fufu、shop-nukunuku）
 * 價格、時間、地址屬於正式資訊：必須勾「資訊已核對」才能發布，發布時自動記錄核對時間。
 */
export const shopInfo = defineType({
  name: "shopInfo",
  title: "來店資訊",
  type: "document",
  icon: PinIcon,
  groups: [
    { name: "basic", title: "地址與聯絡", default: true },
    { name: "hours", title: "營業時間" },
    { name: "price", title: "價格與付款" },
    { name: "rules", title: "入場規則" },
    { name: "access", title: "交通" },
    { name: "checkin", title: "入場確認" },
    { name: "verify", title: "核對" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "brand", title: "品牌", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "address", title: "地址", type: "l10nString", group: "basic", validation: requireZh }),
    defineField({ name: "postalCode", title: "郵遞區號", type: "string", group: "basic" }),
    defineField({ name: "city", title: "城市", type: "string", group: "basic", description: "例如：台北市", initialValue: "台北市" }),
    defineField({ name: "location", title: "座標", type: "geopoint", group: "basic", description: "在 Google 地圖對店家按右鍵即可複製經緯度。" }),
    defineField({ name: "mapUrl", title: "Google 地圖連結", type: "url", group: "basic" }),
    defineField({ name: "phone", title: "電話", type: "string", group: "basic" }),
    defineField({ name: "lineUrl", title: "LINE 官方帳號連結", type: "url", group: "basic" }),
    defineField({ name: "menuImages", title: "菜單圖片", type: "array", group: "price", of: [defineArrayMember({ type: "imageWithAlt" })], options: { layout: "grid" }, description: "飲料與餐點菜單，顯示在「價格・時間・交通」頁。" }),
    defineField({
      name: "hours",
      title: "每週營業時間",
      type: "array",
      group: "hours",
      description: "每天一列。公休日勾選「公休」。",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursRow",
          fields: [
            defineField({ name: "day", title: "星期", type: "string", options: { list: DAYS.map(({ value, title }) => ({ value, title })) }, validation: (r) => r.required() }),
            defineField({ name: "closed", title: "公休", type: "boolean", initialValue: false }),
            defineField({ name: "open", title: "開店", type: "string", description: "格式 11:00", hidden: ({ parent }) => parent?.closed, validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "時間" }) }),
            defineField({ name: "close", title: "打烊", type: "string", description: "格式 20:00", hidden: ({ parent }) => parent?.closed, validation: (r) => r.regex(/^([01]\d|2[0-4]):[0-5]\d$/, { name: "時間" }) }),
          ],
          preview: {
            select: { day: "day", closed: "closed", open: "open", close: "close" },
            prepare: ({ day, closed, open, close }) => ({
              title: DAYS.find((d) => d.value === day)?.title ?? "？",
              subtitle: closed ? "公休" : `${open ?? "?"}–${close ?? "?"}`,
            }),
          },
        }),
      ],
      validation: (r) =>
        r.custom((rows?: { day?: string }[]) => {
          const days = (rows ?? []).map((x) => x.day);
          if (days.length && new Set(days).size !== days.length) return "同一天出現兩次";
          return true;
        }),
    }),
    defineField({
      name: "specialDates",
      title: "特別營業日",
      type: "array",
      group: "hours",
      description: "國定假日、臨時公休、特別營業時間。過期的日期官網會自動隱藏。",
      of: [
        defineArrayMember({
          type: "object",
          name: "specialDate",
          fields: [
            defineField({ name: "date", title: "日期", type: "date", validation: (r) => r.required() }),
            defineField({ name: "closed", title: "公休", type: "boolean", initialValue: true }),
            defineField({ name: "open", title: "開店", type: "string", hidden: ({ parent }) => parent?.closed }),
            defineField({ name: "close", title: "打烊", type: "string", hidden: ({ parent }) => parent?.closed }),
            defineField({ name: "note", title: "說明", type: "l10nString" }),
          ],
          preview: {
            select: { date: "date", closed: "closed", open: "open", close: "close", note: "note.zh" },
            prepare: ({ date, closed, open, close, note }) => ({ title: date, subtitle: [closed ? "公休" : `${open}–${close}`, note].filter(Boolean).join("・") }),
          },
        }),
      ],
    }),
    defineField({
      name: "prices",
      title: "價格方案",
      type: "array",
      group: "price",
      of: [
        defineArrayMember({
          type: "object",
          name: "priceRow",
          fields: [
            defineField({ name: "name", title: "方案名稱", type: "l10nString", description: "例如：每小時、一日暢遊", validation: requireZh }),
            defineField({ name: "weekday", title: "平日價格（新台幣）", type: "number", validation: (r) => r.min(0) }),
            defineField({ name: "holiday", title: "假日價格（新台幣）", type: "number", validation: (r) => r.min(0) }),
            defineField({ name: "note", title: "說明", type: "l10nString" }),
          ],
          preview: {
            select: { title: "name.zh", w: "weekday", h: "holiday" },
            prepare: ({ title, w, h }) => ({ title, subtitle: `平日 ${w ?? "—"}／假日 ${h ?? "—"}` }),
          },
        }),
      ],
    }),
    defineField({ name: "priceNote", title: "價格補充說明", type: "l10nText", group: "price", description: "例如：含一杯飲品、零食另購。" }),
    defineField({
      name: "payments",
      title: "付款方式",
      type: "array",
      group: "price",
      of: [{ type: "string" }],
      options: { list: PAYMENTS.map(({ value, title }) => ({ value, title })) },
    }),
    defineField({ name: "entryAge", title: "最低入場年齡", type: "number", group: "rules", description: "不限年齡請填 0。" }),
    defineField({ name: "entryNote", title: "入場補充說明", type: "l10nString", group: "rules", description: "例如：12 歲以下須成人陪同。" }),
    defineField({ name: "noReservation", title: "免預約", type: "boolean", group: "rules", initialValue: true }),
    defineField({
      name: "rules",
      title: "和貓咪相處的約定",
      type: "array",
      group: "rules",
      of: [
        defineArrayMember({
          type: "object",
          name: "ruleItem",
          fields: [
            defineField({ name: "icon", title: "圖示", type: "string", options: { list: RULE_ICONS.map(({ value, title }) => ({ value, title })) } }),
            defineField({ name: "text", title: "內容", type: "l10nString", validation: requireZh }),
          ],
          preview: { select: { title: "text.zh", subtitle: "icon" } },
        }),
      ],
    }),
    defineField({
      name: "checkinShortDrinks",
      title: "「短暫停留」方案的指定飲品",
      type: "l10nString",
      group: "checkin",
      description: "顯示在入場確認頁（/checkin）。例如：原味奶茶、蜂蜜水。沒填時使用系統預設。",
    }),
    defineField({
      name: "checkinLongMin",
      title: "「悠閒停留」方案每人最低收費（新台幣）",
      type: "number",
      group: "checkin",
      description: "沒填時為 220。",
      validation: (r) => r.min(0),
    }),
    defineField({ name: "mrt", title: "捷運", type: "l10nText", group: "access" }),
    defineField({ name: "bus", title: "公車", type: "l10nText", group: "access" }),
    defineField({ name: "parking", title: "停車", type: "l10nText", group: "access" }),
    defineField({ name: "mapImage", title: "地圖圖片（選填）", type: "imageWithAlt", group: "access", description: "例如手繪路線圖；點擊會開啟 Google 地圖。" }),
    defineField({
      name: "verified",
      title: "資訊已核對",
      type: "boolean",
      group: "verify",
      description: "請確認價格、營業時間、地址、入場規則都正確後勾選。未勾選無法發布。",
      initialValue: false,
      validation: (r) => r.custom((v?: boolean) => (v ? true : "請核對所有資訊後勾選，才能發布")),
    }),
    defineField({
      name: "verifiedAt",
      title: "最後核對時間",
      type: "datetime",
      group: "verify",
      readOnly: true,
      description: "按「核對並發布」時自動記錄，顯示在官網價格表下方。",
    }),
    defineField({ name: "seo", title: "SEO 與分享設定", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { brand: "brand", verifiedAt: "verifiedAt" },
    prepare: ({ brand, verifiedAt }) => ({
      title: `${BRANDS.find((b) => b.id === brand)?.name ?? ""} 來店資訊`,
      subtitle: verifiedAt ? `核對：${String(verifiedAt).slice(0, 10)}` : "尚未核對",
    }),
  },
});
