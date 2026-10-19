import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 從 env.local.txt 讀取設定（Windows 不方便把檔名改成 .env.local 時的備用方案）。
 * 有 .env.local 或環境變數時以它們為準。
 */
function fromTxt(key: string): string | undefined {
  try {
    const file = join(process.cwd(), "env.local.txt");
    if (!existsSync(file)) return undefined;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && m[1] === key) return m[2].replace(/^["']|["']$/g, "") || undefined;
    }
  } catch {
    // 讀不到就當作沒有設定
  }
  return undefined;
}

/**
 * Viewer（唯讀）token。只在伺服器端、且只在管理員開啟「預覽模式」時用來讀取草稿。
 * 檔案開頭的 server-only 會讓任何把它引入瀏覽器程式碼的錯誤在建置時就失敗。
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || fromTxt("SANITY_API_READ_TOKEN");

if (!readToken) {
  console.warn("[sanity] 未設定 SANITY_API_READ_TOKEN：官網正常，但後台「預覽」無法顯示草稿。");
}
