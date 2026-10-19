import { notFound } from "next/navigation";

/** 任何不存在的網址都顯示該語言的 404 頁 */
export default function CatchAll() {
  notFound();
}
