import { brand, shopInfo } from "./documents/brand";
import { cat, faq, game, graduateStory, news } from "./documents/collections";
import { adoptionGuide, contentPage, firstVisitGuide, homePage, listingPage, siteSettings } from "./documents/pages";
import { footerLink, heroSlide, imageWithAlt, richText, seo, socialLink, step } from "./objects/common";
import { l10nRichText, l10nString, l10nTags, l10nText } from "./objects/localized";

export const schemaTypes = [
  // 物件
  richText,
  l10nString,
  l10nText,
  l10nRichText,
  l10nTags,
  imageWithAlt,
  seo,
  heroSlide,
  step,
  footerLink,
  socialLink,
  // 固定頁
  siteSettings,
  homePage,
  brand,
  shopInfo,
  contentPage,
  firstVisitGuide,
  adoptionGuide,
  listingPage,
  // 清單
  cat,
  graduateStory,
  game,
  news,
  faq,
];

/** 只有固定份數、不可新增或刪除的文件類型 */
export const SINGLETON_TYPES = new Set([
  "siteSettings",
  "homePage",
  "brand",
  "shopInfo",
  "contentPage",
  "firstVisitGuide",
  "adoptionGuide",
  "listingPage",
]);
