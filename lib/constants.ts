/**
 * 官網與後台共用的固定選項（不引入 sanity 套件，避免把後台打包進官網）。
 * 選項的顯示文字：後台用 title，官網用 messages/*.json 的翻譯。
 */

export const BRANDS = [
  { id: "fufu", name: "FUFU", official: "FU FU CAT CAFE", logo: "/brand/fufu-logo.png", line: "@qvy2066j",
    socials: [
      { platform: "Instagram", url: "https://www.instagram.com/fufucatcafe/" },
      { platform: "Facebook", url: "https://www.facebook.com/share/1Jzw8M1CaS/" },
      { platform: "Threads", url: "https://www.threads.com/@fufucatcafe" },
    ] },
  { id: "nukunuku", name: "NUKUNUKU", official: "NUKU NUKU CAT CAFE", logo: "/brand/nukunuku-logo.jpg", line: "@808gupte",
    socials: [
      { platform: "Instagram", url: "https://www.instagram.com/nukunukucatcafe/" },
      { platform: "Facebook", url: "https://www.facebook.com/share/1CDHcBQ8bn/" },
      { platform: "Threads", url: "https://www.threads.com/@nukunukucatcafe" },
    ] },
] as const;
export type BrandId = (typeof BRANDS)[number]["id"];
export const isBrand = (v: string): v is BrandId => BRANDS.some((b) => b.id === v);
export const brandOf = (id: BrandId) => BRANDS.find((b) => b.id === id)!;

/** 只有 NUKUNUKU 做中途認養 */
export const ADOPTION_BRAND: BrandId = "nukunuku";

export const CAT_STATUS = [
  { value: "resident", title: "常駐", brands: ["fufu", "nukunuku"], tone: "calm" },
  { value: "adoptable", title: "可認養", brands: ["nukunuku"], tone: "good" },
  { value: "matching", title: "媒合中", brands: ["nukunuku"], tone: "warn" },
  { value: "graduated", title: "已畢業", brands: ["nukunuku"], tone: "muted" },
  { value: "resting", title: "休養中", brands: ["fufu", "nukunuku"], tone: "muted" },
] as const;
export type CatStatus = (typeof CAT_STATUS)[number]["value"];

export const NEWS_CATEGORIES = [
  { value: "announcement", title: "公告" },
  { value: "event", title: "活動" },
  { value: "newCat", title: "新貓咪" },
  { value: "adoption", title: "認養" },
  { value: "media", title: "媒體" },
] as const;

export const FAQ_CATEGORIES = [
  { value: "visit", title: "來店" },
  { value: "interaction", title: "與貓咪相處" },
  { value: "cats", title: "關於貓咪" },
  { value: "adoption", title: "認養" },
] as const;

export const BRAND_SCOPE = [
  { value: "both", title: "共同" },
  { value: "fufu", title: "FUFU" },
  { value: "nukunuku", title: "NUKUNUKU" },
] as const;

export const PAYMENTS = [
  { value: "cash", title: "現金" },
  { value: "card", title: "信用卡" },
  { value: "linepay", title: "LINE Pay" },
  { value: "jkopay", title: "街口支付" },
  { value: "applepay", title: "Apple Pay" },
  { value: "easycard", title: "悠遊卡" },
] as const;

export const PLATFORMS = [
  { value: "web", title: "網頁" },
  { value: "ios", title: "iOS" },
  { value: "android", title: "Android" },
  { value: "line", title: "LINE" },
] as const;

export const DAYS = [
  { value: "mon", title: "週一", schema: "Monday" },
  { value: "tue", title: "週二", schema: "Tuesday" },
  { value: "wed", title: "週三", schema: "Wednesday" },
  { value: "thu", title: "週四", schema: "Thursday" },
  { value: "fri", title: "週五", schema: "Friday" },
  { value: "sat", title: "週六", schema: "Saturday" },
  { value: "sun", title: "週日", schema: "Sunday" },
] as const;
export type DayKey = (typeof DAYS)[number]["value"];

export const RULE_ICONS = [
  { value: "wash", title: "洗手消毒" },
  { value: "noHold", title: "不抱貓" },
  { value: "noChase", title: "不追逐、不吵醒" },
  { value: "noFlash", title: "關閉閃光燈" },
  { value: "noFood", title: "不餵外食" },
  { value: "quiet", title: "放低音量" },
  { value: "child", title: "兒童須陪同" },
  { value: "time", title: "計時方式" },
] as const;

/** 固定頁面的 ID */
export const SINGLETON = {
  home: "homePage",
  settings: "siteSettings",
  firstVisit: "firstVisitGuide",
  adoption: "adoptionGuide",
  about: "page-about",
  privacy: "page-privacy",
} as const;

/** 列表頁設定（標題、說明、SEO） */
export const LISTING_PAGES = [
  { id: "page-visit", title: "價格・時間・交通" },
  { id: "page-cats", title: "所有貓咪" },
  { id: "page-news", title: "最新消息" },
  { id: "page-faq", title: "常見問題" },
  { id: "page-graduates", title: "畢業故事" },
  { id: "page-playroom", title: "貓咪遊樂室" },
] as const;

export const brandDocId = (b: BrandId) => `brand-${b}`;
export const shopDocId = (b: BrandId) => `shop-${b}`;
