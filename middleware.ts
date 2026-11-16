import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // 有些平台（例如 Google 商家的菜單連結）會把網址裡的 # 編碼成 %23，導致找不到頁面；這裡轉回正確的錨點網址
  const raw = req.nextUrl.pathname;
  const i = raw.toLowerCase().indexOf("%23");
  if (i >= 0) {
    const url = req.nextUrl.clone();
    url.pathname = raw.slice(0, i) || "/";
    url.hash = decodeURIComponent(raw.slice(i + 3));
    return NextResponse.redirect(url, 308);
  }
  return intl(req);
}

// 後台、API、養貓前必修課（/academy，靜態遊戲）、入場確認（/checkin，有自己的語言切換）、靜態檔與 sitemap.xml / llms.txt 等含副檔名的網址不經過語言處理
export const config = {
  matcher: ["/((?!api|studio|academy|checkin|_next|_vercel|.*\\..*).*)"],
};
