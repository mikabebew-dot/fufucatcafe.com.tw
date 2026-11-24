/**
 * 「用 LINE 登入」按鈕會連到這裡，轉去 LINE 的授權頁。
 * 需要在 Vercel 設定 LINE_LOGIN_CHANNEL_ID、LINE_LOGIN_CHANNEL_SECRET、ACADEMY_SESSION_SECRET。
 */
import { NextResponse, type NextRequest } from "next/server";
import { STATE_COOKIE, academySecret, cookieBase, lineConfig, makeLoginState, seal } from "@/lib/academy/session";

export const dynamic = "force-dynamic";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/academy";
}

export function GET(req: NextRequest) {
  const line = lineConfig();
  const secret = academySecret();
  if (!line || !secret) return NextResponse.redirect(new URL("/academy?login=unavailable", req.url));

  const { state, nonce } = makeLoginState(secret);
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const redirectUri = new URL("/api/academy/callback", req.nextUrl.origin).toString();

  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", line.id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("scope", "profile openid");

  const res = NextResponse.redirect(url);
  // cookie 只用來記住登入後要回到哪一頁；換了瀏覽器拿不到也沒關係，會回到 /academy
  res.cookies.set(STATE_COOKIE, seal({ next, exp: Date.now() + 15 * 60_000 }, secret), { ...cookieBase, maxAge: 900 });
  return res;
}
