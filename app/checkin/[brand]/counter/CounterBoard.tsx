"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Entry = {
  key: string; code: string; at: string; lang: string; short: number; long: number;
  entered: boolean; enteredAt: string | null; leftAt: string | null;
};
type Today = { date: string | null; groups: number; guests: number; planShort: number; planLong: number; entries: Entry[] };

const LANG_NAME: Record<string, string> = { zh: "中文", en: "English", ja: "日本語", ko: "한국어" };
/** 停留分鐘數（入場到離場；還沒離場就算到現在） */
const stayMin = (e: Entry, now: number) =>
  e.enteredAt ? Math.max(0, Math.round(((e.leftAt ? new Date(e.leftAt).getTime() : now) - new Date(e.enteredAt).getTime()) / 60_000)) : 0;

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

/**
 * 櫃檯看板：每 4 秒更新一次今日確認紀錄。客人出示確認碼 → 找到那一組 → 按「已入場」。
 * 只顯示確認碼、時間、語言、方案人數，沒有任何個資。
 */
export function CounterBoard({
  brand, brandName, other, per10, longMin,
}: { brand: string; brandName: string; other: { id: string; name: string }; per10: number; longMin: number }) {
  const [data, setData] = useState<Today | null>(null);
  const [error, setError] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "waiting" | "inside" | "left">("all");
  const [now, setNow] = useState(() => Date.now());

  // 每 30 秒更新「已待幾分鐘」
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  /** 參考費用：依停留時間，以 10 分鐘四捨五入、上限 100 分鐘；悠閒停留每人最低 longMin */
  const fee = (e: Entry) => {
    const m = stayMin(e, now);
    const blocks = Math.min(10, Math.max(1, Math.round(m / 10)));
    const perShort = blocks * per10;
    const perLong = Math.max(perShort, longMin);
    return { m, perShort, perLong, total: e.short * perShort + e.long * perLong };
  };

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

  /** 標記入場／離場；先在畫面上變更，失敗再改回來 */
  const act = async (e: Entry, action: "enter" | "leave", on: boolean) => {
    setBusy(e.key);
    const stamp = new Date().toISOString();
    const next: Entry =
      action === "enter"
        ? { ...e, entered: on, enteredAt: on ? stamp : null, leftAt: on ? e.leftAt : null }
        : { ...e, leftAt: on ? stamp : null };
    setData((d) => d && { ...d, entries: d.entries.map((x) => (x.key === e.key ? next : x)) });
    try {
      const res = await fetch("/api/checkin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "enter" ? { brand, key: e.key, entered: on } : { brand, key: e.key, left: on }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setData((d) => d && { ...d, entries: d.entries.map((x) => (x.key === e.key ? e : x)) });
    } finally {
      setBusy(null);
    }
  };

  const all = data?.entries ?? [];
  const stateOf = (e: Entry) => (!e.entered ? "waiting" : e.leftAt ? "left" : "inside");
  const list = useMemo(() => {
    const term = q.trim();
    return all.filter((e) => (term ? e.code.includes(term) : filter === "all" || stateOf(e) === filter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, filter]);
  const waiting = all.filter((e) => stateOf(e) === "waiting").length;
  const inside = all.filter((e) => stateOf(e) === "inside");
  const insideGuests = inside.reduce((n, e) => n + e.short + e.long, 0);
  const leftGroups = all.filter((e) => stateOf(e) === "left");
  const avgStay = leftGroups.length ? Math.round(leftGroups.reduce((n, e) => n + stayMin(e, now), 0) / leftGroups.length) : null;

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
          <div className="cb-tile"><strong>{data ? waiting : "—"}</strong><span>等候入場（組）</span></div>
          <div className="cb-tile"><strong>{data ? insideGuests : "—"}</strong><span>目前店內（人）</span></div>
          <div className="cb-tile"><strong>{data ? leftGroups.length : "—"}</strong><span>已離場（組）</span></div>
          <div className="cb-tile"><strong>{avgStay ?? "—"}</strong><span>平均停留（分）</span></div>
        </div>

        <div className="cb-filter" role="tablist" aria-label="篩選">
          {([["all", "全部"], ["waiting", `等候入場 ${waiting}`], ["inside", `店內 ${inside.length}`], ["left", `已離場 ${leftGroups.length}`]] as const).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={filter === k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>

        <input
          className="cb-search tabular"
          inputMode="numeric"
          placeholder="輸入確認碼搜尋"
          aria-label="輸入確認碼搜尋"
          value={q}
          onChange={(e) => setQ(e.target.value.replace(/\D/g, "").slice(0, 4))}
        />

        {data && list.length === 0 && <p className="cb-empty">{q ? "找不到這個確認碼" : filter === "all" ? "今天還沒有客人完成確認。" : "目前沒有符合的組別。"}</p>}
        <ul className="cb-list">
          {list.map((e) => {
            const st = stateOf(e);
            const fresh = st === "waiting" && now - new Date(e.at).getTime() < 15 * 60_000;
            const f = fee(e);
            return (
              <li key={e.key} className={`cb-item cb-${st}${fresh ? " new" : ""}`}>
                <span className="cb-code tabular">{e.code}</span>
                <div className="cb-meta">
                  <span>
                    {e.short > 0 && `短暫 ${e.short} 人`}
                    {e.short > 0 && e.long > 0 && "・"}
                    {e.long > 0 && `悠閒 ${e.long} 人`}
                  </span>
                  {st === "waiting" && <small className="tabular">確認 {fmt(e.at)}・{LANG_NAME[e.lang] ?? e.lang}</small>}
                  {st === "inside" && e.enteredAt && (
                    <small className="tabular">入場 {fmt(e.enteredAt)}・已待 <b>{f.m}</b> 分</small>
                  )}
                  {st === "left" && e.enteredAt && e.leftAt && (
                    <small className="tabular">
                      {fmt(e.enteredAt)}–{fmt(e.leftAt)}・{f.m} 分・參考 <b>NT${f.total}</b>
                      {e.short > 0 && e.long > 0 ? `（短暫每人 ${f.perShort}／悠閒每人 ${f.perLong}）` : `（每人 ${e.long > 0 ? f.perLong : f.perShort}）`}
                    </small>
                  )}
                </div>
                <div className="cb-actions">
                  {st === "waiting" && (
                    <button type="button" className="btn" onClick={() => act(e, "enter", true)} disabled={busy === e.key}>已入場</button>
                  )}
                  {st === "inside" && (
                    <>
                      <button type="button" className="btn" onClick={() => act(e, "leave", true)} disabled={busy === e.key}>客人離場</button>
                      <button type="button" className="cb-undo" onClick={() => act(e, "enter", false)} disabled={busy === e.key}>取消入場</button>
                    </>
                  )}
                  {st === "left" && (
                    <button type="button" className="cb-undo" onClick={() => act(e, "leave", false)} disabled={busy === e.key}>復原離場</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="cb-status">
          停留時間從按「已入場」算到按「客人離場」。費用是依時間自動算的參考金額，實際結帳仍以櫃檯登記為準。這裡只記錄確認碼、時間、語言和方案人數，不記錄任何個資。
        </p>
      </main>
    </div>
  );
}
