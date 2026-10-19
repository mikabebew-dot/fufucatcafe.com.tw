import { routing, type Locale } from "@/i18n/routing";

/** 語言代碼 → 後台欄位代碼（每個多語欄位都有 zh / en / ja / ko 四格） */
export const CONTENT_KEY: Record<Locale, "zh" | "en" | "ja" | "ko"> = {
  "zh-Hant": "zh",
  en: "en",
  ja: "ja",
  ko: "ko",
};

/** hreflang 與 <html lang> */
export const HREFLANG: Record<Locale, string> = {
  "zh-Hant": "zh-Hant-TW",
  en: "en",
  ja: "ja",
  ko: "ko",
};

export const OG_LOCALE: Record<Locale, string> = {
  "zh-Hant": "zh_TW",
  en: "en_US",
  ja: "ja_JP",
  ko: "ko_KR",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  "zh-Hant": "繁中",
  en: "EN",
  ja: "日本語",
  ko: "한국어",
};

/** 語言前綴（繁中為空字串） */
export function localePrefix(locale: Locale) {
  return locale === routing.defaultLocale ? "" : `/${locale}`;
}

export function isLocale(v: string): v is Locale {
  return (routing.locales as readonly string[]).includes(v);
}
