/**
 * 入場確認完成頁上，客人點了某隻中途貓或「認養流程」時記一次（KPI：認養資訊點閱）。
 * 用 navigator.sendBeacon 送出，所以讀 text 再解析。
 */
import { NextResponse, type NextRequest } from "next/server";
import { isBrand } from "@/lib/constants";
import { recordAdoptClick } from "@/lib/checkin/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (typeof b.brand !== "string" || !isBrand(b.brand) || typeof b.cat !== "string" || !/^[a-z0-9-]{1,60}$/i.test(b.cat)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await recordAdoptClick(b.brand, b.cat);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[checkin] 認養點閱紀錄失敗", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
