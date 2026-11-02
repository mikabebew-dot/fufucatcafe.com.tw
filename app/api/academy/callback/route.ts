/**
 * LINE 授權完成後回到這裡：用授權碼換 ID token，向 LINE 驗證後取得名稱，
 * 建立（或更新）玩家紀錄，再把簽章過的登入資訊存在 cookie。
 * 這個網址必須登記在 LINE Developers 的 Callback URL。
 */
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE, SESSION_DAYS, STATE_COOKIE, academySecret, cookieBase, lineConfig, playerId, seal, unseal,
  type Session,
} from "@/lib/academy/session";
import { upsertPlayer } from "@/lib/academy/store";

export const dynamic = "force-dynamic";

type LoginState = { state: string; nonce: string; next: string };

export async function GET(req: NextRequest) {
  const line = lineConfig();
  const secret = academySecret();
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/academy?login=${reason}`, req.url));
    res.cookies.delete(STATE_COOKIE);
    return res;
  };
  if (!line || !secret) return fail("unavailable");

  const params = req.nextUrl.searchParams;
  const saved = unseal<LoginState>(req.cookies.get(STATE_COOKIE)?.value, secret);
  if (params.get("error")) return fail("cancelled");
  const code = params.get("code");
  if (!saved || !code || params.get("state") !== saved.state) return fail("failed");

  try {
    const redirectUri = new URL("/api/academy/callback", req.nextUrl.origin).toString();
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: line.id, client_secret: line.secret }),
    });
    if (!tokenRes.ok) return fail("failed");
    const { id_token } = (await tokenRes.json()) as { id_token?: string };
    if (!id_token) return fail("failed");

    const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token, client_id: line.id, nonce: saved.nonce }),
    });
    if (!verifyRes.ok) return fail("failed");
    const profile = (await verifyRes.json()) as { sub?: string; name?: string; picture?: string };
    if (!profile.sub) return fail("failed");

    const pid = playerId(profile.sub, secret);
    const name = (profile.name ?? "").slice(0, 60);
    await upsertPlayer(pid, { sub: profile.sub, name, picture: profile.picture });

    const session: Session = { pid, sub: profile.sub, name, exp: Date.now() + SESSION_DAYS * 86_400_000 };
    const res = NextResponse.redirect(new URL(saved.next || "/academy", req.url));
    res.cookies.set(SESSION_COOKIE, seal(session, secret), { ...cookieBase, maxAge: SESSION_DAYS * 86_400 });
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    console.error("[academy] LINE 登入失敗", e);
    return fail("failed");
  }
}
