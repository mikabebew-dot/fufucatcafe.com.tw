import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import data from "./questions.json";

/**
 * 養貓前必修課的紀錄存在 Sanity，所有文件 ID 都以「academy.」開頭。
 * Sanity 規定 ID 含「.」的文件只有帶 token 或登入後台的人讀得到，
 * 所以這些紀錄不會出現在公開 API，只有後台「必修課紀錄」看得到。
 */
export const ZONE_IDS = new Set(data.zones.map((z) => z.id));
export const ZONE_COUNT = data.zones.length;
const QUESTIONS = data.questions as Record<string, { zone: string; text: string; type: string }>;

export function academyClient() {
  const token = process.env.SANITY_ACADEMY_TOKEN;
  if (!token) return undefined;
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });
}

/** 台灣時間的日期，例如 2026-11-02 */
export const taipeiDate = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

type ZoneRecord = { runs?: number; completedAt?: string; bestAccuracy?: number };
type Player = {
  _id: string;
  badges?: string[];
  zones?: Record<string, ZoneRecord>;
  completedAllAt?: string;
};

export async function upsertPlayer(pid: string, profile: { sub: string; name: string; picture?: string }) {
  const client = academyClient();
  if (!client) return undefined;
  const now = new Date().toISOString();
  const id = `academy.player.${pid}`;
  await client
    .transaction()
    .createIfNotExists({ _id: id, _type: "academyPlayer", firstSeen: now, runs: 0, badges: [], zones: {} })
    .patch(id, (p) => p.set({ lineUserId: profile.sub, name: profile.name, picture: profile.picture ?? "", lastSeen: now }))
    .commit({ visibility: "async" });
  return client.fetch<Player | null>(`*[_id == $id][0]{_id, badges}`, { id });
}

export async function getPlayer(pid: string) {
  const client = academyClient();
  if (!client) return undefined;
  return client.fetch<Player | null>(`*[_id == $id][0]{_id, badges}`, { id: `academy.player.${pid}` });
}

export type RunInput = { zone: string; completed: boolean; results: { qid: string; ok: boolean }[] };

/** 驗證前端送來的一局結果；只接受題庫裡存在、而且屬於該課的題目 */
export function parseRun(body: unknown): RunInput | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.zone !== "string" || !ZONE_IDS.has(b.zone)) return undefined;
  if (!Array.isArray(b.results) || b.results.length === 0 || b.results.length > 40) return undefined;
  const results: RunInput["results"] = [];
  for (const r of b.results) {
    if (!r || typeof r !== "object") return undefined;
    const { qid, ok } = r as Record<string, unknown>;
    if (typeof qid !== "string" || typeof ok !== "boolean") return undefined;
    if (QUESTIONS[qid]?.zone !== b.zone) return undefined;
    results.push({ qid, ok });
  }
  // 完成一課至少要答 8 題一般題＋3 題最終關
  const completed = b.completed === true && results.length >= 11;
  return { zone: b.zone, completed, results };
}

export async function recordRun(run: RunInput, pid?: string) {
  const client = academyClient();
  if (!client) return { saved: false };
  const now = new Date().toISOString();
  const day = taipeiDate();
  const correct = run.results.filter((r) => r.ok).length;
  const accuracy = Math.round((correct / run.results.length) * 100);

  const tx = client.transaction();

  const zoneId = `academy.zone.${run.zone}`;
  tx.createIfNotExists({ _id: zoneId, _type: "academyZoneStat", zone: run.zone, runs: 0, completions: 0 });
  tx.patch(zoneId, (p) => p.inc({ runs: 1, completions: run.completed ? 1 : 0 }));

  const dayId = `academy.day.${day}`;
  tx.createIfNotExists({ _id: dayId, _type: "academyDayStat", date: day, runs: 0, completions: 0, memberRuns: 0, members: {} });
  tx.patch(dayId, (p) => {
    let q = p.inc({ runs: 1, completions: run.completed ? 1 : 0, memberRuns: pid ? 1 : 0 });
    if (pid) q = q.setIfMissing({ members: {} }).set({ [`members.p${pid}`]: true });
    return q;
  });

  // 同一局同一題只算一次
  const seen = new Map<string, boolean>();
  for (const r of run.results) if (!seen.has(r.qid)) seen.set(r.qid, r.ok);
  for (const [qid, ok] of seen) {
    const q = QUESTIONS[qid];
    const id = `academy.q.${qid}`;
    tx.createIfNotExists({ _id: id, _type: "academyQuestionStat", qid, zone: q.zone, text: q.text, attempts: 0, wrong: 0 });
    tx.patch(id, (p) => p.set({ text: q.text }).inc({ attempts: 1, wrong: ok ? 0 : 1 }));
  }

  let badges: string[] | undefined;
  if (pid) {
    const id = `academy.player.${pid}`;
    const player = await client.fetch<Player | null>(`*[_id == $id][0]{_id, badges, zones, completedAllAt}`, { id });
    if (player) {
      const prev = player.zones?.[run.zone] ?? {};
      const zoneRec: ZoneRecord = { runs: (prev.runs ?? 0) + 1, bestAccuracy: prev.bestAccuracy, completedAt: prev.completedAt };
      badges = [...(player.badges ?? [])];
      if (run.completed) {
        zoneRec.bestAccuracy = Math.max(prev.bestAccuracy ?? 0, accuracy);
        zoneRec.completedAt = prev.completedAt ?? now;
        if (!badges.includes(run.zone)) badges.push(run.zone);
      }
      const set: Record<string, unknown> = { lastSeen: now, badges, [`zones.${run.zone}`]: zoneRec };
      if (badges.length >= ZONE_COUNT && !player.completedAllAt) set.completedAllAt = now;
      tx.patch(id, (p) => p.setIfMissing({ zones: {}, runs: 0 }).inc({ runs: 1 }).set(set));
    }
  }

  await tx.commit({ visibility: "async" });
  return { saved: true, badges };
}
