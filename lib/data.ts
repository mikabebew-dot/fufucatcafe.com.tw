import "server-only";
import type { Locale } from "@/i18n/routing";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
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
  const p = { lang: CONTENT_KEY[locale], today: todayTaipei(), ...params };
  // 管理員預覽：走即時草稿
  if ((await draftMode()).isEnabled) {
    const { data } = await sanityFetch({ query, params: p, ...(opts.stega === false ? { stega: false } : {}) });
    return data as T;
  }
  // 一般訪客：已發布內容。直接向 Sanity CDN 取（CDN 本身幾秒內就會更新），
  // 不在官網這端另外快取，避免訪客看到舊版本
  return client.fetch<T>(query, p, { stega: false, cache: "no-store" });
}
