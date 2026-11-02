/**
 * 每局結束（過關、箭用完或中途回地圖）時，遊戲把每題對錯送到這裡。
 * 沒登入也會記錄（只計入遊玩次數與答錯率）；有登入再加上個人成績與徽章。
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/academy/session";
import { parseRun, recordRun } from "@/lib/academy/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const run = parseRun(body);
  if (!run) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const session = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  try {
    const result = await recordRun(run, session?.pid);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[academy] 紀錄失敗", e);
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}
