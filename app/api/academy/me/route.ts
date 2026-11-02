/** 遊戲載入時查詢登入狀態與已取得的徽章 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, academySecret, lineConfig, readSession } from "@/lib/academy/session";
import { academyClient, getPlayer } from "@/lib/academy/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const available = Boolean(lineConfig() && academySecret() && academyClient());
  const session = available ? readSession(req.cookies.get(SESSION_COOKIE)?.value) : undefined;
  let badges: string[] = [];
  if (session) {
    try {
      badges = (await getPlayer(session.pid))?.badges ?? [];
    } catch (e) {
      console.error("[academy] 讀取玩家失敗", e);
    }
  }
  return NextResponse.json(
    { available, loggedIn: Boolean(session), name: session?.name ?? "", badges },
    { headers: { "Cache-Control": "no-store" } },
  );
}
