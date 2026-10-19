/**
 * 後台「預覽」工具會帶一組一次性密鑰呼叫這裡；驗證通過才開啟 draft mode。
 * 一般訪客無法自行開啟預覽（沒有有效密鑰會被拒絕）。
 */
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: readToken }),
});
