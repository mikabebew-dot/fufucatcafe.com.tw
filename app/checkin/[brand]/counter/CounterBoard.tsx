"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Entry = { key: string; code: string; at: string; lang: string; short: number; long: number; entered: boolean };
type Today = { date: string | null; groups: number; guests: number; planShort: number; planLong: number; entries: Entry[] };

const LANG_NAME: Record<string, string> = { zh: "中文", en: "English", ja: "日本語", ko: "한국어" };
const fmt = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

/**
 * 櫃檯看板：每 4 秒更新一次今日確認紀錄。客人出示確認碼 → 找到那一組 → 按「已入場」。
 * 只顯示確認碼、時間、語言、方案人數，沒有任何個資。
 */
export function CounterBoard({ brand, brandName, other }: { brand: string; brandName: string; other: { id: string; name: string } }) {
  const [data, setData] = useState<Today | null>(null);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin?brand=${brand}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setError(false);
      setUpdated(new Date());
    } catch {
      setError(true);
    }
  }, [brand]);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 4000);
    return () => clearInterval(t);
  }, [load]);

  const toggle = async (e: Entry) => {
    setBusy(e.key);
    // 先在畫面上變更，失敗再改回來
    setData((d) => d && { ...d, entries: d.entries.map((x) => (x.key === e.key ? { ...x, entered: !e.entered } : x)) });
    try {
      const res = await fetch("/api/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, key: e.key, entered: !e.entered }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setData((d) => d && { ...d, entries: d.entries.map((x) => (x.key === e.key ? { ...x, entered: e.entered } : x)) });
    } finally {
      setBusy(null);
    }
  };

  const list = useMemo(() => {
    const all = data?.entries ?? [];
    const term = q.trim();
    return term ? all.filter((e) => e.code.includes(term)) : all;
  }, [data, q]);
  const waiting = (data?.entries ?? []).filter((e) => !e.entered).length;

  return (
    <div className="cb" data-brand={brand}>
      <main className="cb-main">
        <div className="cb-head">
          <div>
            <h1>{brandName}・櫃檯看板</h1>
            <p className={`cb-status${error ? " bad" : ""}`} role="status">
              {error ? "暫時連不上，正在重試…" : updated ? `今天 ${data?.date ?? ""}・${fmt(updated.toISOString())} 更新` : "讀取中…"}
            </p>
          </div>
          <div className="cb-links">
            <a className="btn" href={`/checkin/${brand}?kiosk=1`} target="_blank" rel="noopener">開啟平板確認畫面</a>
            <a className="btn btn-ghost" href={`/checkin/${brand}/qr`} target="_blank" rel="noopener">列印入場 QR 立牌</a>
            <a className="btn btn-ghost" href={`/checkin/${brand}/cats/qr`} target="_blank" rel="noopener">列印貓咪介紹 QR 卡</a>
            <a className="btn btn-ghost" href={`/checkin/${other.id}/counter`}>切換到 {other.name}</a>
          </div>
        </div>

        <div className="cb-tiles">
          <div className="cb-tile"><strong>{data?.groups ?? "—"}</strong><span>今日確認組數</span></div>
          <div className="cb-tile"><strong>{data?.guests ?? "—"}</strong><span>今日確認人數</span></div>
          <div className="cb-tile"><strong>{data?.planShort ?? "—"}</strong><span>短暫停留（人）</span></div>
          <div className="cb-tile"><strong>{data?.planLong ?? "—"}</strong><span>悠閒停留（人）</span></div>
          <div className="cb-tile"><strong>{data ? waiting : "—"}</strong><span>還沒按入場的組</span></div>
        </div>

        <input
          className="cb-search tabular"
          inputMode="numeric"
          placeholder="輸入確認碼搜尋"
          aria-label="輸入確認碼搜尋"
          value={q}
          onChange={(e) => setQ(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />

        {data && list.length === 0 && <p className="cb-empty">{q ? "找不到這個確認碼" : "今天還沒有客人完成確認。"}</p>}
        <ul className="cb-list">
          {list.map((e) => {
            const fresh = !e.entered && Date.now() - new Date(e.at).getTime() < 15 * 60_000;
            return (
              <li key={e.key} className={`cb-item${fresh ? " new" : ""}${e.entered ? " done" : ""}`}>
                <span className="cb-code tabular">{e.code}</span>
                <div className="cb-meta">
                  <span>
                    {e.short > 0 && `短暫 ${e.short} 人`}
                    {e.short > 0 && e.long > 0 && "・"}
                    {e.long > 0 && `悠閒 ${e.long} 人`}
                  </span>
                  <small className="tabular">{fmt(e.at)}・{LANG_NAME[e.lang] ?? e.lang}</small>
                </div>
                <button type="button" className={e.entered ? "btn btn-ghost" : "btn"} onClick={() => toggle(e)} disabled={busy === e.key}>
                  {e.entered ? "已入場 ✓" : "已入場"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="cb-status">實際計費時間與人數仍以櫃檯登記為準。這裡只記錄確認碼、時間、語言和方案人數，不記錄任何個資。</p>
      </main>
    </div>
  );
}
