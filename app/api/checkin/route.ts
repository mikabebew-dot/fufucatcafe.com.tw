/**
 * 入場確認 API
 * POST  客人完成確認 → 回傳確認碼
 * GET   ?brand=nukunuku  櫃檯看板讀取今日紀錄
 * PATCH 櫃檯標記「已入場」／「客人離場」
 */
import { NextResponse, type NextRequest } from "next/server";
import { isBrand } from "@/lib/constants";
import { getToday, markEntry, parseConfirm, recordConfirm } from "@/lib/checkin/store";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  return !origin || origin === req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const input = parseConfirm(body);
  if (!input) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const entry = await recordConfirm(input);
    if (!entry) return NextResponse.json({ saved: false }, { status: 503 });
    return NextResponse.json({ saved: true, code: entry.code, at: entry.at }, { headers: NO_STORE });
  } catch (e) {
    console.error("[checkin] 紀錄失敗", e);
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand") ?? "";
  if (!isBrand(brand)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const day = await getToday(brand);
    if (day === undefined) return NextResponse.json({ error: "unconfigured" }, { status: 503 });
    const entries = [...(day?.entries ?? [])].reverse().map(({ _key, code, at, lang, short, long, entered, enteredAt, leftAt }) => ({
      key: _key, code, at, lang, short, long, entered: !!entered, enteredAt: enteredAt ?? null, leftAt: leftAt ?? null,
    }));
    return NextResponse.json(
      { date: day?.date ?? null, groups: day?.groups ?? 0, guests: day?.guests ?? 0, planShort: day?.planShort ?? 0, planLong: day?.planLong ?? 0, entries },
      { headers: NO_STORE },
    );
  } catch (e) {
    console.error("[checkin] 讀取失敗", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  // { entered: true/false } 標記入場；{ left: true/false } 標記離場
  const action = typeof b.left === "boolean" ? "leave" : typeof b.entered === "boolean" ? "enter" : null;
  if (typeof b.brand !== "string" || !isBrand(b.brand) || typeof b.key !== "string" || !action) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    const ok = await markEntry(b.brand, b.key, action, (action === "leave" ? b.left : b.entered) as boolean);
    return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
  } catch (e) {
    console.error("[checkin] 標記失敗", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
