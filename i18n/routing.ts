import { defineRouting } from "next-intl/routing";

/**
 * 網址規則：繁體中文在根目錄（/fufu），其他語言加前綴（/en/fufu、/ja/fufu、/ko/fufu）。
 * 不依瀏覽器語言自動跳轉，避免搜尋引擎與熟客被導到非預期語言；改由頁尾語言切換。
 */
export const routing = defineRouting({
  locales: ["zh-Hant", "en", "ja", "ko"],
  defaultLocale: "zh-Hant",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
