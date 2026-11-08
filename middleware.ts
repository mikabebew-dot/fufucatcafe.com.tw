import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// 後台、API、養貓前必修課（/academy，靜態遊戲）、入場確認（/checkin，有自己的語言切換）、靜態檔與 sitemap.xml / llms.txt 等含副檔名的網址不經過語言處理
export const config = {
  matcher: ["/((?!api|studio|academy|checkin|_next|_vercel|.*\\..*).*)"],
};
