/** 登出：清掉登入 cookie，回到遊戲首頁 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/academy/session";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/academy", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
