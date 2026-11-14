/**
 * 客滿與候位 API
 * GET   ?brand=           公開：是否客滿、候位組數（含另一家店）
 * GET   ?brand=&key=      客人查自己的候位號碼、前面幾組、是否輪到
 * GET   ?brand=&list=1    櫃檯：完整候位名單（要櫃檯密碼）
 * POST  { brand, phone, size, lang }   客人登記候位
 * PATCH { brand, full }               櫃檯切換客滿（要櫃檯密碼）
 * PATCH { brand, key, state }         櫃檯改狀態（要密碼）；客人自己只能取消
 */
import { NextResponse, type NextRequest } from "next/server";
import { BRANDS, isBrand } from "@/lib/constants";
import { isLang } from "@/lib/checkin/content";
import {
  counterPinOk, getStatus, joinWait, listWait, markWait, normPhone, setFull, waitInfo, type WaitState,
} from "@/lib/checkin/store";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };
const STATES: WaitState[] = ["waiting", "called", "seated", "cancelled"];

const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get("origin");
  return !origin || origin === req.nextUrl.origin;
};
const pin = (req: NextRequest) => req.headers.get("x-counter-pin");
const bad = (status = 400) => NextResponse.json({ error: "invalid" }, { status });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const brand = q.get("brand") ?? "";
  if (!isBrand(brand)) return bad();
  try {
    if (q.get("list") === "1") {
      if (!counterPinOk(pin(req))) return NextResponse.json({ error: "pin" }, { status: 401 });
      const [list, status] = await Promise.all([listWait(brand), getStatus(brand)]);
      if (!list) return NextResponse.json({ error: "unconfigured" }, { status: 503 });
      return NextResponse.json({ full: status.full, list }, { headers: NO_STORE });
    }
    const key = q.get("key");
    if (key) {
      const info = await waitInfo(brand, key);
      if (info === undefined) return bad();
      return NextResponse.json(info ?? { gone: true }, { headers: NO_STORE });
    }
    const other = BRANDS.find((b) => b.id !== brand)!.id;
    const [me, them] = await Promise.all([getStatus(brand), getStatus(other)]);
    return NextResponse.json({ ...me, other: them }, { headers: NO_STORE });
  } catch (e) {
    console.error("[checkin/wait] 讀取失敗", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return bad(403);
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return bad();
  }
  const phone = normPhone(b.phone);
  const size = typeof b.size === "number" && Number.isInteger(b.size) ? b.size : 0;
  if (typeof b.brand !== "string" || !isBrand(b.brand) || !phone || size < 1 || size > 20 || !isLang(b.lang)) return bad();
  try {
    const w = await joinWait(b.brand, { phone, size, lang: b.lang });
    if (!w) return NextResponse.json({ saved: false }, { status: 503 });
    return NextResponse.json({ saved: true, key: w._key, no: w.no }, { headers: NO_STORE });
  } catch (e) {
    console.error("[checkin/wait] 登記失敗", e);
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return bad(403);
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return bad();
  }
  if (typeof b.brand !== "string" || !isBrand(b.brand)) return bad();
  const staff = counterPinOk(pin(req));
  try {
    if (typeof b.full === "boolean") {
      if (!staff) return NextResponse.json({ error: "pin" }, { status: 401 });
      return NextResponse.json({ ok: await setFull(b.brand, b.full) });
    }
    const state = b.state as WaitState;
    if (typeof b.key !== "string" || !STATES.includes(state)) return bad();
    // 沒有密碼的人（客人自己）只能取消自己的候位
    if (!staff && state !== "cancelled") return NextResponse.json({ error: "pin" }, { status: 401 });
    const ok = await markWait(b.brand, b.key, state);
    return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
  } catch (e) {
    console.error("[checkin/wait] 更新失敗", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
