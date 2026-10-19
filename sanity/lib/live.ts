import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { readToken } from "./token";

/**
 * sanityFetch：
 * - 一般訪客 → 只讀「已發布」內容，並在內容發布後自動更新（不需重新部署）
 * - 管理員在後台「預覽」→ 透過 draft mode 讀取草稿（browserToken 只會在 draft mode 下送到瀏覽器）
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: readToken || false,
  browserToken: readToken || false,
});
