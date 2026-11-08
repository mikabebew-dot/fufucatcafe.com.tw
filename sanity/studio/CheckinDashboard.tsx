/**
 * 後台「入場紀錄」：入場確認系統（/checkin）每天的確認組數、人數、語言、方案與認養資訊點閱。
 * 紀錄文件 ID 以「checkin.」開頭，只有登入後台的人讀得到。可匯出 CSV 作為補助計畫的成果佐證。
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useClient } from "sanity";

type Day = {
  _id: string; brand: "fufu" | "nukunuku"; date: string;
  groups?: number; guests?: number; planShort?: number; planLong?: number;
  langs?: Record<string, number>; adoptClicks?: number; adoptPage?: number; fosterViews?: number; catClicks?: Record<string, number>;
};
type Cat = { slug: string; name: string };

const C = { ink: "#3e3b3a", muted: "#6f6a66", line: "#e4e0db", soft: "#f1efec", green: "#4f7a72", rust: "#a75337", ground: "#faf9f7" };
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
  td: { borderBottom: `1px solid ${C.soft}`, padding: "7px 8px", whiteSpace: "nowrap" },
  num: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
  btn: { border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, borderRadius: 999, padding: "7px 16px", font: "inherit", fontSize: 14, cursor: "pointer", textDecoration: "none" },
  btnOn: { background: C.green, borderColor: C.green, color: "#fff" },
  row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  err: { background: "#f9e1dc", color: "#7e3c26", borderRadius: 14, padding: "14px 16px" },
};

const LANG = [["zh", "中文"], ["en", "英文"], ["ja", "日文"], ["ko", "韓文"]] as const;
const BRAND_NAME = { fufu: "FUFU", nukunuku: "NUKUNUKU" } as const;
const keyOf = (slug: string) => slug.replace(/[^a-z0-9]/gi, "_").slice(0, 60);
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CheckinDashboard() {
  const base = useClient({ apiVersion: "2025-07-01" });
  const client = useMemo(() => base.withConfig({ perspective: "raw" }), [base]);
  const [days, setDays] = useState<Day[] | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState<"all" | "fufu" | "nukunuku">("all");
  const [range, setRange] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await client.fetch<{ days: Day[]; cats: Cat[] }>(`{
        "days": *[_type == "checkinDayStat" && _id in path("checkin.day.**")] | order(date desc)[0...400]{
          _id, brand, date, groups, guests, planShort, planLong, langs, adoptClicks, adoptPage, fosterViews, catClicks
        },
        "cats": *[_type == "cat" && brand == "nukunuku" && defined(slug.current) && !(_id in path("drafts.**"))]{ "slug": slug.current, "name": name.zh }
      }`);
      setDays(r.days);
      setCats(r.cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    if (!days) return [];
    const since = new Date(Date.now() - range * 86400_000).toISOString().slice(0, 10);
    return days.filter((d) => (brand === "all" || d.brand === brand) && d.date >= since);
  }, [days, brand, range]);

  const sum = useMemo(() => {
    const t = { groups: 0, guests: 0, short: 0, long: 0, adopt: 0, adoptPage: 0, views: 0, langs: { zh: 0, en: 0, ja: 0, ko: 0 } as Record<string, number>, cat: {} as Record<string, number> };
    for (const d of rows) {
      t.groups += d.groups ?? 0;
      t.guests += d.guests ?? 0;
      t.short += d.planShort ?? 0;
      t.long += d.planLong ?? 0;
      t.adopt += d.adoptClicks ?? 0;
      t.adoptPage += d.adoptPage ?? 0;
      t.views += d.fosterViews ?? 0;
      for (const [k, v] of Object.entries(d.langs ?? {})) t.langs[k] = (t.langs[k] ?? 0) + v;
      for (const [k, v] of Object.entries(d.catClicks ?? {})) t.cat[k] = (t.cat[k] ?? 0) + v;
    }
    return t;
  }, [rows]);

  const catName = (key: string) => cats.find((c) => keyOf(c.slug) === key)?.name ?? key;
  const catRank = Object.entries(sum.cat).sort((a, b) => b[1] - a[1]);
  const foreign = sum.groups - (sum.langs.zh ?? 0);

  const exportCsv = () =>
    downloadCsv(`入場紀錄_${new Date().toISOString().slice(0, 10)}.csv`, [
      ["日期", "店", "確認組數", "確認人數", "先喝指定飲品人數", "一入場全部飲品人數", "中文組", "英文組", "日文組", "韓文組", "等家孩子頁瀏覽", "中途貓介紹點閱", "認養流程點閱"],
      ...rows.map((d) => [
        d.date, BRAND_NAME[d.brand], d.groups ?? 0, d.guests ?? 0, d.planShort ?? 0, d.planLong ?? 0,
        d.langs?.zh ?? 0, d.langs?.en ?? 0, d.langs?.ja ?? 0, d.langs?.ko ?? 0, d.fosterViews ?? 0, d.adoptClicks ?? 0, d.adoptPage ?? 0,
      ]),
    ]);

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.head}>
          <div>
            <h1 style={s.h1}>入場確認・紀錄</h1>
            <p style={s.note}>客人網址 /checkin/fufu、/checkin/nukunuku。只記錄確認時間、語言、方案人數與認養資訊點閱，不含任何個資。店內「等家的孩子」QR：/checkin/nukunuku/cats/qr、/checkin/fufu/cats/qr。</p>
          </div>
          <div style={s.row}>
            <a style={s.btn} href="/checkin/nukunuku/counter" target="_blank" rel="noopener">NUKUNUKU 櫃檯看板</a>
            <a style={s.btn} href="/checkin/fufu/counter" target="_blank" rel="noopener">FUFU 櫃檯看板</a>
            <button style={s.btn} onClick={load} disabled={loading}>{loading ? "讀取中…" : "重新整理"}</button>
          </div>
        </div>

        <div style={s.row}>
          {(["all", "nukunuku", "fufu"] as const).map((b) => (
            <button key={b} style={{ ...s.btn, ...(brand === b ? s.btnOn : {}) }} onClick={() => setBrand(b)}>{b === "all" ? "兩店合計" : BRAND_NAME[b]}</button>
          ))}
          <span style={{ width: 12 }} />
          {[7, 30, 90, 365].map((n) => (
            <button key={n} style={{ ...s.btn, ...(range === n ? s.btnOn : {}) }} onClick={() => setRange(n)}>近 {n} 天</button>
          ))}
          <span style={{ flex: 1 }} />
          <button style={s.btn} onClick={exportCsv} disabled={!rows.length}>匯出 CSV</button>
        </div>

        {error && <div style={s.err}>讀取失敗：{error}</div>}
        {!days && !error && <p style={s.note}>讀取中…</p>}

        {days && (
          <>
            <div style={s.tiles}>
              <div style={s.tile}><span style={s.big}>{sum.groups}</span><span style={s.small}>完成確認組數</span></div>
              <div style={s.tile}><span style={s.big}>{sum.guests}</span><span style={s.small}>完成確認人數</span></div>
              <div style={s.tile}><span style={s.big}>{pct(foreign, sum.groups)}%</span><span style={s.small}>使用外語的組（英日韓）</span></div>
              <div style={s.tile}><span style={s.big}>{pct(sum.long, sum.guests)}%</span><span style={s.small}>選一入場全部飲品的人</span></div>
              <div style={s.tile}><span style={s.big}>{sum.views}</span><span style={s.small}>「等家的孩子」頁瀏覽</span></div>
              <div style={s.tile}><span style={s.big}>{sum.adopt}</span><span style={s.small}>中途貓介紹點閱</span></div>
              <div style={s.tile}><span style={s.big}>{sum.adoptPage}</span><span style={s.small}>認養流程點閱</span></div>
            </div>

            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              <section style={s.card}>
                <h2 style={s.h2}>語言分布（組）</h2>
                <table style={s.table}>
                  <tbody>
                    {LANG.map(([k, label]) => (
                      <tr key={k}>
                        <td style={s.td}>{label}</td>
                        <td style={{ ...s.td, ...s.num }}>{sum.langs[k] ?? 0}</td>
                        <td style={{ ...s.td, ...s.num, color: C.muted }}>{pct(sum.langs[k] ?? 0, sum.groups)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section style={s.card}>
                <h2 style={s.h2}>最常被點開的中途貓</h2>
                {catRank.length === 0 ? <p style={s.note}>還沒有點閱紀錄。</p> : (
                  <table style={s.table}>
                    <tbody>
                      {catRank.slice(0, 10).map(([k, v]) => (
                        <tr key={k}><td style={s.td}>{catName(k)}</td><td style={{ ...s.td, ...s.num }}>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </div>

            <section style={s.card}>
              <h2 style={s.h2}>每日明細</h2>
              {rows.length === 0 ? <p style={s.note}>這段期間還沒有紀錄。</p> : (
                <div style={s.scroll}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>日期</th><th style={s.th}>店</th>
                        <th style={{ ...s.th, ...s.num }}>組</th><th style={{ ...s.th, ...s.num }}>人</th>
                        <th style={{ ...s.th, ...s.num }}>指定飲品</th><th style={{ ...s.th, ...s.num }}>全部飲品</th>
                        <th style={{ ...s.th, ...s.num }}>外語組</th><th style={{ ...s.th, ...s.num }}>等家頁瀏覽</th><th style={{ ...s.th, ...s.num }}>中途貓點閱</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((d) => (
                        <tr key={d._id}>
                          <td style={s.td}>{d.date}</td>
                          <td style={{ ...s.td, color: d.brand === "nukunuku" ? C.rust : C.green }}>{BRAND_NAME[d.brand]}</td>
                          <td style={{ ...s.td, ...s.num }}>{d.groups ?? 0}</td>
                          <td style={{ ...s.td, ...s.num }}>{d.guests ?? 0}</td>
                          <td style={{ ...s.td, ...s.num }}>{d.planShort ?? 0}</td>
                          <td style={{ ...s.td, ...s.num }}>{d.planLong ?? 0}</td>
                          <td style={{ ...s.td, ...s.num }}>{(d.groups ?? 0) - (d.langs?.zh ?? 0)}</td>
                          <td style={{ ...s.td, ...s.num }}>{d.fosterViews ?? 0}</td>
                          <td style={{ ...s.td, ...s.num }}>{(d.adoptClicks ?? 0) + (d.adoptPage ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
