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

/**
 * LINE 授權用的 state：本身就帶簽章和期限，不依賴 cookie。
 * 從 IG、FB 等 App 內建瀏覽器登入時，LINE 常會在另一個瀏覽器（或 LINE App）開回 callback，
 * 這時原本瀏覽器的 cookie 帶不過去；改成 state 自我驗證，換瀏覽器也能完成登入。
 * 格式全為英數字：16 碼隨機 + 9 碼期限（36 進位）+ 24 碼簽章。
 */
const STATE_TTL_MS = 15 * 60_000;
const mac = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("hex");

export function makeLoginState(secret: string) {
  const rand = randomBytes(8).toString("hex");
  const exp = (Date.now() + STATE_TTL_MS).toString(36).padStart(9, "0");
  const state = rand + exp + mac(`state:${rand}${exp}`, secret).slice(0, 24);
  return { state, nonce: loginNonce(state, secret) };
}

export function checkLoginState(state: string | null, secret: string): { nonce: string } | undefined {
  if (!state || !/^[0-9a-z]{49}$/.test(state)) return undefined;
  const rand = state.slice(0, 16), exp = state.slice(16, 25), given = state.slice(25);
  const expected = mac(`state:${rand}${exp}`, secret).slice(0, 24);
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(given))) return undefined;
  if (parseInt(exp, 36) < Date.now()) return undefined;
  return { nonce: loginNonce(state, secret) };
}

const loginNonce = (state: string, secret: string) => mac(`nonce:${state}`, secret).slice(0, 32);

export function readSession(cookieValue: string | undefined): Session | undefined {
  const secret = academySecret();
  if (!secret) return undefined;
  return unseal<Session>(cookieValue, secret);
}

export const cookieBase = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
