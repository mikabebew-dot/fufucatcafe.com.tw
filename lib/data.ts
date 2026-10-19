import "server-only";
import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { CONTENT_KEY, isLocale } from "./locale";

/** 台北今天的日期（YYYY-MM-DD），用來隱藏過期的特別營業日 */
export function todayTaipei() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei" }).format(new Date());
}

/**
 * 讀取已發布內容（管理員在預覽模式時讀草稿）。
 * 自動帶入 $lang 與 $today。
 */
export async function load<T>(
  query: string,
  locale: Locale,
  params: Record<string, unknown> = {},
  opts: { stega?: boolean } = {},
): Promise<T> {
  // 例如 /favicon.ico 這類不是語言代碼的網址 → 直接 404，不去查資料
  if (!isLocale(locale)) notFound();
  const { data } = await sanityFetch({
    query,
    params: { lang: CONTENT_KEY[locale], today: todayTaipei(), ...params },
    ...(opts.stega === false ? { stega: false } : {}),
  });
  return data as T;
}
