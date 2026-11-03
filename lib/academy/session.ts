import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * 養貓前必修課的登入狀態。
 * 用 LINE 登入後，把「玩家代號、LINE 名稱」簽章後存在瀏覽器 cookie（30 天），
 * 伺服器靠簽章確認沒有被竄改，不需要另外的會員資料庫。
 */
export const SESSION_COOKIE = "academy_session";
export const STATE_COOKIE = "academy_login";
export const SESSION_DAYS = 30;

export type Session = { pid: string; sub: string; name: string; exp: number };

export function academySecret(): string | undefined {
  const s = process.env.ACADEMY_SESSION_SECRET;
  return s && s.length >= 32 ? s : undefined;
}

export function lineConfig() {
  const id = process.env.LINE_LOGIN_CHANNEL_ID;
  const secret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  return id && secret ? { id, secret } : undefined;
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString("utf8");

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function seal(payload: object, secret: string): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body, secret)}`;
}

export function unseal<T>(value: string | undefined, secret: string): T | undefined {
  if (!value) return undefined;
  const [body, mac] = value.split(".");
  if (!body || !mac) return undefined;
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return undefined;
  try {
    const data = JSON.parse(unb64(body)) as T & { exp?: number };
    if (typeof data.exp === "number" && data.exp < Date.now()) return undefined;
    return data;
  } catch {
    return undefined;
  }
}

/** LINE 使用者 ID 轉成不可逆的玩家代號，用在文件 ID（文件 ID 不放個資） */
export function playerId(lineSub: string, secret: string): string {
  return createHmac("sha256", secret).update(`player:${lineSub}`).digest("hex").slice(0, 24);
}

export const randomToken = () => randomBytes(24).toString("base64url");

export function readSession(cookieValue: string | undefined): Session | undefined {
  const secret = academySecret();
  if (!secret) return undefined;
  return unseal<Session>(cookieValue, secret);
}

export const cookieBase = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
