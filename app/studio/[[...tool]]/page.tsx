/**
 * 後台網址：/studio
 * 登入由 Sanity 處理（Google / GitHub / Email），只有被加入專案的成員可以進入與修改。
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
