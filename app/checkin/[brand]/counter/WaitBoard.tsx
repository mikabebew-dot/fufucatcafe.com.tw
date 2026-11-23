"use client";

import { useCallback, useEffect, useState } from "react";

type Wait = {
  _key: string; no: number; phone?: string; size: number; lang: string; at: string;
  state: "waiting" | "called" | "seated" | "cancelled"; calledAt?: string; doneAt?: string;
};

const PIN_KEY = "checkin:counter-pin";
const LANG_NAME: Record<string, string> = { zh: "中文", en: "English", ja: "日本語", ko: "한국어", th: "泰文", vi: "越南文", id: "印尼文" };
const fmt = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const telHref = (p: string) => `tel:${p}`;
const showPhone = (p: string) => (/^09\d{8}$/.test(p) ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);

/**
 * 櫃檯看板上方的「客滿／候位」區。
 * 「客滿」開關不用密碼，任何店員都能按。
 * 候位名單有電話（個資），要輸入櫃檯密碼才看得到；密碼存在這台平板上，不用每次輸入。
 */
export function WaitBoard({ brand, now }: { brand: string; now: number }) {
  const [pin, setPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinBad, setPinBad] = useState(false);
  const [full, setFull] = useState(false);
  const [list, setList] = useState<Wait[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    try {
      setPin(localStorage.getItem(PIN_KEY));
    } catch {
      /* 讀不到就請店員輸入 */
    }
  }, []);

  const load = useCallback(async () => {
    if (!pin) {
      // 沒有密碼：只讀公開狀態（是否客滿、候位幾組），沒有電話
      try {
        const res = await fetch(`/api/checkin/wait?brand=${brand}`, { cache: "no-store" });
        if (res.ok) {
          const j = (await res.json()) as { full: boolean; waiting: number };
          setFull(j.full);
          setWaitingCount(j.waiting);
        }
      } catch {
        /* 下次再試 */
      }
      return;
    }
    try {
      const res = await fetch(`/api/checkin/wait?brand=${brand}&list=1`, { cache: "no-store", headers: { "x-counter-pin": pin } });
      if (res.status === 401) {
        setPin(null);
        setPinBad(true);
        try {
          localStorage.removeItem(PIN_KEY);
        } catch {
          /* 略過 */
        }
        return;
      }
      if (!res.ok) return;
      const j = (await res.json()) as { full: boolean; list: Wait[] };
      setFull(j.full);
      setList(j.list);
    } catch {
      /* 下次再試 */
    }
  }, [brand, pin]);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 5000);
    return () => clearInterval(t);
  }, [load]);

  const send = async (body: Record<string, unknown>) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (pin) headers["x-counter-pin"] = pin;
    const res = await fetch("/api/checkin/wait", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ brand, ...body }),
    });
    return res.ok;
  };

  const toggleFull = async () => {
    setBusy("full");
    const next = !full;
    setFull(next);
    if (!(await send({ full: next }).catch(() => false))) setFull(!next);
    setBusy(null);
  };

  const mark = async (w: Wait, state: Wait["state"]) => {
    setBusy(w._key);
    setList((l) => l && l.map((x) => (x._key === w._key ? { ...x, state, calledAt: state === "called" ? new Date().toISOString() : x.calledAt } : x)));
    if (!(await send({ key: w._key, state }).catch(() => false))) load();
    setBusy(null);
  };

  const pinForm = (
    <form
      className="cb-pin"
      onSubmit={(e) => {
        e.preventDefault();
        const v = pinInput.trim();
        if (!v) return;
        try {
          localStorage.setItem(PIN_KEY, v);
        } catch {
          /* 只存在這次畫面 */
        }
        setPinBad(false);
        setPin(v);
        setPinInput("");
      }}
    >
      <input type="password" inputMode="numeric" autoComplete="off" placeholder="櫃檯密碼" aria-label="櫃檯密碼" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
      <button type="submit" className="btn">看候位名單</button>
      <span className="cb-status">{pinBad ? "密碼不對，請再試一次。" : "候位名單有客人電話，需要密碼；輸入一次後這台平板會記住。"}</span>
    </form>
  );

  const active = (list ?? []).filter((w) => w.state === "waiting" || w.state === "called");
  const done = (list ?? []).filter((w) => w.state === "seated" || w.state === "cancelled");
  const waitMin = (w: Wait) => Math.max(0, Math.round((now - new Date(w.at).getTime()) / 60_000));

  return (
    <section className={`cb-wait${full ? " is-full" : ""}`}>
      <div className="cb-wait-head">
        <h2>
          客滿／候位
          <small>{pin ? `候位中 ${active.length} 組・${active.reduce((n, w) => n + w.size, 0)} 人` : `候位中 ${waitingCount} 組`}</small>
        </h2>
        <button type="button" className={`cb-fullbtn${full ? " on" : ""}`} onClick={toggleFull} disabled={busy === "full"} aria-pressed={full}>
          {full ? "● 客滿中（按此開放入場）" : "目前開放入場（按此設為客滿）"}
        </button>
      </div>
      <p className="cb-status">
        {full
          ? "客人掃碼或用平板時，會看到「登記候位」和「前往另一家店」，不會進入入場確認。"
          : "開放中也可以讓候位的客人留著；有空位時按「通知」打電話給下一組。"}
      </p>

      {!pin && pinForm}

      {active.length > 0 && (
        <ul className="cb-list">
          {active.map((w) => (
            <li key={w._key} className={`cb-item cb-w-${w.state}`}>
              <span className="cb-code tabular">#{String(w.no).padStart(2, "0")}</span>
              <div className="cb-meta">
                <span>
                  {w.size} 人・{w.phone ? <a href={telHref(w.phone)} className="tabular">{showPhone(w.phone)}</a> : "—"}
                </span>
                <small className="tabular">
                  {fmt(w.at)} 登記・已等 <b>{waitMin(w)}</b> 分・{LANG_NAME[w.lang] ?? w.lang}
                  {w.state === "called" && w.calledAt && `・${fmt(w.calledAt)} 已通知`}
                </small>
              </div>
              <div className="cb-actions">
                {w.state === "waiting" ? (
                  <button type="button" className="btn" onClick={() => mark(w, "called")} disabled={busy === w._key}>通知</button>
                ) : (
                  <button type="button" className="btn" onClick={() => mark(w, "seated")} disabled={busy === w._key}>已入座</button>
                )}
                {w.state === "called" && (
                  <button type="button" className="cb-undo" onClick={() => mark(w, "waiting")} disabled={busy === w._key}>改回等候</button>
                )}
                <button type="button" className="cb-undo" onClick={() => mark(w, "cancelled")} disabled={busy === w._key}>取消</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <button type="button" className="cb-undo" onClick={() => setShowDone(!showDone)}>
          {showDone ? "收起" : `今天已處理 ${done.length} 組`}
        </button>
      )}
      {showDone && (
        <ul className="cb-list">
          {done.map((w) => (
            <li key={w._key} className="cb-item cb-left">
              <span className="cb-code tabular">#{String(w.no).padStart(2, "0")}</span>
              <div className="cb-meta">
                <span>{w.size} 人・{w.state === "seated" ? "已入座" : "已取消"}</span>
                <small className="tabular">
                  {fmt(w.at)} 登記{w.doneAt && `・${fmt(w.doneAt)} ${w.state === "seated" ? "入座" : "取消"}`}
                  {w.doneAt && `（等了 ${Math.round((new Date(w.doneAt).getTime() - new Date(w.at).getTime()) / 60_000)} 分）`}
                </small>
              </div>
              <span />
            </li>
          ))}
        </ul>
      )}
      <p className="cb-status">入座或取消後，電話會立即刪除；沒處理完的電話隔天也會自動刪除。</p>
    </section>
  );
}
