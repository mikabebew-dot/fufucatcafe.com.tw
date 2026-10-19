"use client";

/**
 * Sanity 後台設定，網址 /studio
 * 登入、帳號、權限由 Sanity 處理（不自行開發會員系統）。
 */
import { zhHantLocale } from "@sanity/locale-zh-hant";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { BRANDS, LISTING_PAGES, SINGLETON, brandDocId, shopDocId } from "./lib/constants";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { SINGLETON_TYPES, schemaTypes } from "./sanity/schemaTypes";
import { resolve } from "./sanity/studio/presentation";
import { PublishWithVerify } from "./sanity/studio/publishWithVerify";
import { structure } from "./sanity/studio/structure";

/** 固定頁只允許：發布、捨棄草稿、還原舊版本（不可刪除、複製、下架） */
const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);
/** 由選單建立、不出現在「新增」選單的範本 */
const HIDDEN_TEMPLATE = (id: string) =>
  SINGLETON_TYPES.has(id) || /^(brand|shop|page)-/.test(id) || id === "cat";

export default defineConfig({
  name: "default",
  title: "FUFU × NUKUNUKU 後台",
  basePath: "/studio",
  projectId,
  dataset,

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      // 有多份固定文件的類型改用下方專屬範本（自動帶入品牌）；其餘保留預設範本
      ...prev.filter((t) => !["brand", "shopInfo", "listingPage", "contentPage", "cat"].includes(t.schemaType)),
      ...BRANDS.flatMap((b) => [
        { id: brandDocId(b.id), title: `${b.name} 品牌頁`, schemaType: "brand", value: { brand: b.id } },
        { id: shopDocId(b.id), title: `${b.name} 來店資訊`, schemaType: "shopInfo", value: { brand: b.id, noReservation: true } },
        { id: `cat-${b.id}`, title: `${b.name} 的貓咪`, schemaType: "cat", value: { brand: b.id, status: "resident" } },
      ]),
      ...LISTING_PAGES.map((p) => ({ id: p.id, title: p.title, schemaType: "listingPage", value: { title: { zh: p.title } } })),
      { id: SINGLETON.about, title: "品牌理念", schemaType: "contentPage", value: { title: { zh: "品牌理念" } } },
      { id: SINGLETON.privacy, title: "隱私權政策", schemaType: "contentPage", value: { title: { zh: "隱私權政策" } } },
    ],
  },

  document: {
    actions: (input, context) => {
      if (!SINGLETON_TYPES.has(context.schemaType)) return input;
      const allowed = input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action));
      if (context.schemaType !== "shopInfo") return allowed;
      // 來店資訊：發布時自動記錄核對時間
      return allowed.map((a) => (a.action === "publish" ? PublishWithVerify : a));
    },
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((t) => !HIDDEN_TEMPLATE(t.templateId)) : prev,
  },

  plugins: [
    structureTool({ title: "內容", structure }),
    presentationTool({
      title: "預覽",
      resolve,
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    zhHantLocale(),
    visionTool({ defaultApiVersion: apiVersion, title: "查詢" }),
  ],
});
