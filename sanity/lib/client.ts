import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

/**
 * 公開讀取用 client：不帶任何 token，perspective 固定為 "published"，
 * 因此訪客端程式碼永遠只能拿到「已發布」內容。
 */
const LOGIC_FIELDS = new Set([
  "brand", "status", "category", "platforms", "platform", "payments", "day", "icon", "gender",
  "slug", "current", "link", "url", "mapUrl", "lineUrl", "applyUrl", "phone", "date", "open", "close",
  "birthday", "arrivedAt", "graduatedAt", "publishedAt", "eventStart", "eventEnd", "until", "entryAge", "postalCode",
]);

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    studioUrl: "/studio",
    // 預覽模式會在文字中加入隱形標記；以下欄位是程式判斷用的代碼或網址，不能加標記
    filter: (props) => {
      const path = props.sourcePath.filter((p) => typeof p === "string") as string[];
      const key = path[path.length - 1];
      if (key && LOGIC_FIELDS.has(key)) return false;
      return props.filterDefault(props);
    },
  },
});
