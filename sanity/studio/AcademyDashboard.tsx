/**
 * 後台「必修課紀錄」：養貓前必修課（/academy）的玩家人數、遊玩次數、每題答錯率與完成名單。
 * 紀錄文件的 ID 都以「academy.」開頭，只有登入後台的人讀得到，公開網站與 API 都看不到。
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useClient } from "sanity";
import data from "@/lib/academy/questions.json";

type ZoneRecord = { runs?: number; completedAt?: string; bestAccuracy?: number };
type Player = { _id: string; name?: string; picture?: string; firstSeen?: string; lastSeen?: string; runs?: number; badges?: string[]; zones?: Record<string, ZoneRecord>; completedAllAt?: string };
type Day = { _id: string; date: string; runs?: number; completions?: number; memberRuns?: number; members?: Record<string, boolean> };
type ZoneStat = { _id: string; zone: string; runs?: number; completions?: number };
type QStat = { _id: string; qid: string; zone: string; text?: string; attempts?: number; wrong?: number };
type Rows = { players: Player[]; days: Day[]; zones: ZoneStat[]; questions: QStat[] };

const ZONES = data.zones;
const zoneName = (id: string) => ZONES.find((z) => z.id === id)?.name ?? id;
const MIN_ATTEMPTS = 5;

const C = { ink: "#3e3b3a", muted: "#6f6a66", line: "#e4e0db", soft: "#f1efec", green: "#4f7a72", red: "#b4472f", ground: "#faf9f7" };
const s: Record<string, CSSProperties> = {
  page: { height: "100%", overflowY: "auto", background: C.ground, color: C.ink, padding: "20px 16px 48px", boxSizing: "border-box" },
  wrap: { maxWidth: 1040, margin: "0 auto", display: "grid", gap: 20 },
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
  h2: { fontSize: 16, fontWeight: 700, margin: "0 0 10px" },
  note: { fontSize: 13, color: C.muted, margin: "4px 0 0", lineHeight: 1.6 },
  tiles: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 },
  tile: { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "12px 14px" },
  big: { fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums", display: "block" },
  small: { fontSize: 12.5, color: C.muted },
  card: { background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 16, minWidth: 0 },
  scroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: { textAlign: "left", fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.line}`, padding: "6px 8px", whiteSpace: "nowrap" },
  td: { borderBottom: `1px solid ${C.soft}`, padding: "7px 8px", verticalAlign: "top" },
  num: { textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  btn: { border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, borderRadius: 999, padding: "7px 16px", font: "inherit", fontSize: 14, cursor: "pointer" },
  btnOn: { background: C.green, borderColor: C.green, color: "#fff" },
  bar: { height: 8, borderRadius: 4, background: C.soft, overflow: "hidden", minWidth: 80 },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  err: { background: "#f9e1dc", color: "#7e3c26", borderRadius: 14, padding: "14px 16px" },
};

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function Bar({ value, color = C.green }: { value: number; color?: string }) {
  return (
    <div style={s.bar}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color }} />
    </div>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AcademyDashboard() {
  const base = useClient({ apiVersion: "2025-07-01" });
  const client = useMemo(() => base.withConfig({ perspective: "raw" }), [base]);
  const [rows, setRows] = useState<Rows | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"wrong" | "players" | "done">("wrong");
  const [zoneFilter, setZoneFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await client.fetch<Rows>(`{
        "players": *[_type == "academyPlayer" && _id in path("academy.player.*")] | order(lastSeen desc),
        "days": *[_type == "academyDayStat" && _id in path("academy.day.*")] | order(date desc)[0...30],
        "zones": *[_type == "academyZoneStat" && _id in path("academy.zone.*")],
        "questions": *[_type == "academyQuestionStat" && _id in path("academy.q.*")]
      }`);
      setRows(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    if (!rows) return null;
    const runs = rows.zones.reduce((a, z) => a + (z.runs ?? 0), 0);
    const completions = rows.zones.reduce((a, z) => a + (z.completions ?? 0), 0);
    const memberRuns = rows.days.reduce((a, d) => a + (d.memberRuns ?? 0), 0);
    const dayRuns = rows.days.reduce((a, d) => a + (d.runs ?? 0), 0);
    const finished = rows.players.filter((p) => p.completedAllAt);
    const week = new Set<string>();
    rows.days.slice(0, 7).forEach((d) => Object.keys(d.members ?? {}).forEach((k) => week.add(k)));
    return { runs, completions, players: rows.players.length, finished: finished.length, weekPlayers: week.size, guestShare: dayRuns ? 100 - pct(memberRuns, dayRuns) : 0 };
  }, [rows]);

  const wrongList = useMemo(() => {
    if (!rows) return [];
    return rows.questions
      .filter((q) => (q.attempts ?? 0) >= MIN_ATTEMPTS && (zoneFilter === "all" || q.zone === zoneFilter))
      .map((q) => ({ ...q, rate: pct(q.wrong ?? 0, q.attempts ?? 0) }))
      .sort((a, b) => b.rate - a.rate || (b.attempts ?? 0) - (a.attempts ?? 0));
  }, [rows, zoneFilter]);

  const finishedPlayers = useMemo(() => (rows ? rows.players.filter((p) => p.completedAllAt).sort((a, b) => (a.completedAllAt! < b.completedAllAt! ? -1 : 1)) : []), [rows]);

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.head}>
          <div>
            <h1 style={s.h1}>養貓前必修課・紀錄</h1>
            <p style={s.note}>遊戲網址 /academy。沒登入的玩家只計入遊玩次數和答錯率；用 LINE 登入的玩家會留下個人成績。</p>
          </div>
          <button style={s.btn} onClick={load} disabled={loading}>{loading ? "讀取中…" : "重新整理"}</button>
        </div>

        {error && <div style={s.err}>讀取失敗：{error}</div>}
        {!rows && !error && <p style={s.note}>讀取中…</p>}

        {rows && totals && (
          <>
            <div style={s.tiles}>
              <div style={s.tile}><span style={s.big}>{totals.players}</span><span style={s.small}>LINE 登入玩家</span></div>
              <div style={s.tile}><span style={s.big}>{totals.weekPlayers}</span><span style={s.small}>近 7 天有玩的登入玩家</span></div>
              <div style={s.tile}><span style={s.big}>{totals.runs}</span><span style={s.small}>總遊玩次數（含訪客）</span></div>
              <div style={s.tile}><span style={s.big}>{totals.completions}</span><span style={s.small}>過關次數</span></div>
              <div style={s.tile}><span style={s.big}>{totals.finished}</span><span style={s.small}>完成全部 8 課</span></div>
              <div style={s.tile}><span style={s.big}>{totals.guestShare}%</span><span style={s.small}>近 30 天訪客遊玩比例</span></div>
            </div>

            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              <section style={s.card}>
                <h2 style={s.h2}>每日遊玩（近 30 天）</h2>
                {rows.days.length === 0 ? <p style={s.note}>還沒有人玩過。</p> : (
                  <div style={s.scroll}>
                    <table style={s.table}>
                      <thead><tr><th style={s.th}>日期</th><th style={{ ...s.th, ...s.num }}>遊玩</th><th style={{ ...s.th, ...s.num }}>過關</th><th style={{ ...s.th, ...s.num }}>登入玩家</th></tr></thead>
                      <tbody>
                        {rows.days.map((d) => (
                          <tr key={d._id}>
                            <td style={s.td}>{d.date}</td>
                            <td style={{ ...s.td, ...s.num }}>{d.runs ?? 0}</td>
                            <td style={{ ...s.td, ...s.num }}>{d.completions ?? 0}</td>
                            <td style={{ ...s.td, ...s.num }}>{Object.keys(d.members ?? {}).length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section style={s.card}>
                <h2 style={s.h2}>各堂課</h2>
                <div style={s.scroll}>
                  <table style={s.table}>
                    <thead><tr><th style={s.th}>課程</th><th style={{ ...s.th, ...s.num }}>遊玩</th><th style={{ ...s.th, ...s.num }}>過關</th><th style={s.th}>過關率</th></tr></thead>
                    <tbody>
                      {ZONES.map((z, i) => {
                        const st = rows.zones.find((x) => x.zone === z.id);
                        const r = pct(st?.completions ?? 0, st?.runs ?? 0);
                        return (
                          <tr key={z.id}>
                            <td style={s.td}>第 {i + 1} 課・{z.name}</td>
                            <td style={{ ...s.td, ...s.num }}>{st?.runs ?? 0}</td>
                            <td style={{ ...s.td, ...s.num }}>{st?.completions ?? 0}</td>
                            <td style={s.td}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Bar value={r} /><span style={s.small}>{r}%</span></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div style={s.tabs}>
              {([["wrong", "每題答錯率"], ["players", `登入玩家（${rows.players.length}）`], ["done", `完成 8 課名單（${finishedPlayers.length}）`]] as const).map(([k, t]) => (
                <button key={k} style={{ ...s.btn, ...(view === k ? s.btnOn : {}) }} onClick={() => setView(k)}>{t}</button>
              ))}
            </div>

            {view === "wrong" && (
              <section style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ ...s.note, margin: 0 }}>答錯率由高到低。作答少於 {MIN_ATTEMPTS} 次的題目先不列入，避免數字失真。答錯率高的題目，適合拿來做衛教貼文。</p>
                  <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} style={{ ...s.btn, padding: "6px 12px" }}>
                    <option value="all">全部課程</option>
                    {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                {wrongList.length === 0 ? <p style={s.note}>資料還不夠，等更多人玩過後就會出現。</p> : (
                  <div style={s.scroll}>
                    <table style={s.table}>
                      <thead><tr><th style={s.th}>題目</th><th style={s.th}>課程</th><th style={{ ...s.th, ...s.num }}>作答</th><th style={s.th}>答錯率</th></tr></thead>
                      <tbody>
                        {wrongList.map((q) => (
                          <tr key={q._id}>
                            <td style={{ ...s.td, minWidth: 260 }}>{q.text}<div style={s.small}>{q.qid}</div></td>
                            <td style={{ ...s.td, whiteSpace: "nowrap" }}>{zoneName(q.zone)}</td>
                            <td style={{ ...s.td, ...s.num }}>{q.attempts}</td>
                            <td style={s.td}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><Bar value={q.rate} color={q.rate >= 50 ? C.red : C.green} /><span style={s.small}>{q.rate}%</span></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {view === "players" && (
              <section style={s.card}>
                {rows.players.length === 0 ? <p style={s.note}>還沒有人用 LINE 登入。</p> : (
                  <div style={s.scroll}>
                    <table style={s.table}>
                      <thead><tr><th style={s.th}>LINE 名稱</th><th style={s.th}>徽章</th><th style={{ ...s.th, ...s.num }}>遊玩次數</th><th style={s.th}>第一次</th><th style={s.th}>最近一次</th></tr></thead>
                      <tbody>
                        {rows.players.map((p) => (
                          <tr key={p._id}>
                            <td style={s.td}>{p.name || "（未提供名稱）"}</td>
                            <td style={s.td}>{(p.badges ?? []).length} / {ZONES.length}<div style={s.small}>{(p.badges ?? []).map(zoneName).join("、")}</div></td>
                            <td style={{ ...s.td, ...s.num }}>{p.runs ?? 0}</td>
                            <td style={{ ...s.td, whiteSpace: "nowrap" }}>{fmtDate(p.firstSeen)}</td>
                            <td style={{ ...s.td, whiteSpace: "nowrap" }}>{fmtDate(p.lastSeen)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {view === "done" && (
              <section style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ ...s.note, margin: 0 }}>完成全部 8 堂課的玩家，依完成時間排序。認養面談時可請對方出示 LINE 名稱核對。</p>
                  <button
                    style={s.btn}
                    disabled={!finishedPlayers.length}
                    onClick={() => downloadCsv(`養貓前必修課_完成名單_${new Date().toISOString().slice(0, 10)}.csv`, [
                      ["LINE 名稱", "完成時間", "平均最佳答對率", "遊玩次數"],
                      ...finishedPlayers.map((p) => {
                        const accs = Object.values(p.zones ?? {}).map((z) => z.bestAccuracy ?? 0);
                        return [p.name ?? "", fmtDate(p.completedAllAt), accs.length ? `${Math.round(accs.reduce((a, b) => a + b, 0) / accs.length)}%` : "", p.runs ?? 0];
                      }),
                    ])}
                  >
                    下載 CSV
                  </button>
                </div>
                {finishedPlayers.length === 0 ? <p style={s.note}>還沒有人完成全部 8 課。</p> : (
                  <div style={s.scroll}>
                    <table style={s.table}>
                      <thead><tr><th style={s.th}>LINE 名稱</th><th style={s.th}>完成時間</th><th style={s.th}>各課最佳答對率</th></tr></thead>
                      <tbody>
                        {finishedPlayers.map((p) => (
                          <tr key={p._id}>
                            <td style={s.td}>{p.name || "（未提供名稱）"}</td>
                            <td style={{ ...s.td, whiteSpace: "nowrap" }}>{fmtDate(p.completedAllAt)}</td>
                            <td style={s.td}><span style={s.small}>{ZONES.map((z) => `${z.name} ${p.zones?.[z.id]?.bestAccuracy ?? "—"}%`).join("・")}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
