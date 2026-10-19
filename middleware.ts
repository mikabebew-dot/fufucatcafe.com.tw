import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// 後台、API、靜態檔與 sitemap.xml / llms.txt 等含副檔名的網址不經過語言處理
export const config = {
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};
