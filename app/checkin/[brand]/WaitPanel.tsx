"use client";

import { useCallback, useEffect, useState } from "react";
import { STORE_ADDR, T, tr, type Lang } from "@/lib/checkin/content";
import type { BrandId } from "@/lib/constants";

export type Status = { full: boolean; waiting: number; other?: { full: boolean; waiting: number } };
export type Ticket = { key: string; no: number };
type Info = { no: number; size: number; state: "waiting" | "called" | "seated" | "cancelled"; ahead: number } | { gone: true };

const TICKET_KEY = (brand: string) => `checkin:${brand}:wait`;

export function loadTicket(brand: string): Ticket | null {
  try {
    const t = JSON.parse(localStorage.getItem(TICKET_KEY(brand)) ?? "null") as (Ticket & { at: number }) | null;
    return t && Date.now() - t.at < 12 * 3600_000 ? t : null;
  } catch {
    return null;
  }
}
const saveTicket = (brand: string, t: Ticket | null) => {
  try {
    if (t) localStorage.setItem(TICKET_KEY(brand), JSON.stringify({ ...t, at: Date.now() }));
    else localStorage.removeItem(TICKET_KEY(brand));
  } catch {
    /* 存不了就只留在畫面上 */
  }
};

/**
 * 客滿畫面：登記候位，或改去另一家店。
 * 手機登記後號碼會留在這支手機上，每 15 秒更新一次「前面還有幾組／輪到了」。
 * 櫃檯平板登記後只顯示號碼，30 秒後回到客滿畫面給下一位。
 */
export function WaitPanel({
  brand, other, lang, kiosk, status, ticket, setTicket, onRead,
}: {
  brand: BrandId;
  other: { id: BrandId; name: string };
  lang: Lang;
  kiosk: boolean;
  status: Status;
  ticket: Ticket | null;
  setTicket: (t: Ticket | null) => void;
  onRead: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState(2);
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [ended, setEnded] = useState<"cancelled" | "seated" | null>(null);

  const poll = useCallback(async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/checkin/wait?brand=${brand}&key=${ticket.key}`, { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as Info;
      setInfo((prev) => {
        if ("state" in j && j.state === "called" && !(prev && "state" in prev && prev.state === "called")) {
          try {
            navigator.vibrate?.([300, 150, 300]);
          } catch {
            /* 不支援就略過 */
          }
        }
        return j;
      });
      if ("gone" in j || j.state === "cancelled" || j.state === "seated") {
        setEnded("gone" in j ? "cancelled" : j.state === "seated" ? "seated" : "cancelled");
        saveTicket(brand, null);
      }
    } catch {
      /* 下次再試 */
    }
  }, [brand, ticket]);

  useEffect(() => {
    if (!ticket || kiosk) return;
    poll();
    const t = setInterval(() => document.visibilityState === "visible" && poll(), 15_000);
    return () => clearInterval(t);
  }, [ticket, kiosk, poll]);

  // 櫃檯平板：顯示號碼 30 秒後清掉，給下一位客人用
  useEffect(() => {
    if (!kiosk || !ticket) return;
    const t = setTimeout(() => setTicket(null), 30_000);
    return () => clearTimeout(t);
  }, [kiosk, ticket, setTicket]);

  const join = async () => {
    setErr(null);
    const clean = phone.replace(/[\s\-()]/g, "");
    if (!/^(09\d{8}|\+?\d{8,15})$/.test(clean)) return setErr(tr(T.waitBadPhone, lang));
    setSending(true);
    try {
      const res = await fetch("/api/checkin/wait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, phone: clean, size, lang }),
      });
      const j = (await res.json()) as { saved?: boolean; key?: string; no?: number };
      if (!res.ok || !j.saved || !j.key || !j.no) throw new Error();
      const t = { key: j.key, no: j.no };
      if (!kiosk) saveTicket(brand, t);
      setTicket(t);
      setPhone("");
      setInfo(null);
    } catch {
      setErr(tr(T.waitFail, lang));
    } finally {
      setSending(false);
    }
  };

  const cancel = async () => {
    if (!ticket) return;
    try {
      await fetch("/api/checkin/wait", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, key: ticket.key, state: "cancelled" }),
      });
    } catch {
      /* 櫃檯那邊也可以取消 */
    }
    saveTicket(brand, null);
    setEnded("cancelled");
  };

  const o = status.other;
  const otherCard = (
    <div className="ck-card ck-other">
      <div className="ck-other-head">
        <strong>{tr(T.otherTitle, lang, { other: `${other.name} CAT CAFE` })}</strong>
        {o && (
          <span className={`ck-badge${o.full ? " warn" : " ok"}`}>
            {o.full ? tr(T.otherFull, lang, { n: o.waiting }) : tr(T.otherOpen, lang)}
          </span>
        )}
      </div>
      <p className="ck-muted">{STORE_ADDR[other.id].addr}</p>
      {!kiosk && (
        <a className="btn btn-ghost btn-block" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE_ADDR[other.id].map)}`} target="_blank" rel="noopener">
          {tr(T.otherMap, lang)}
        </a>
      )}
    </div>
  );

  if (ended) {
    return (
      <section className="ck-stack">
        <div className="ck-done" role="status">
          <h1>{tr(ended === "seated" ? T.waitSeated : T.waitCancelled, lang)}</h1>
        </div>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => { setEnded(null); setTicket(null); }}>
          {tr(T.backHome, lang)}
        </button>
      </section>
    );
  }

  if (ticket) {
    const st = info && "state" in info ? info : null;
    const called = st?.state === "called";
    return (
      <section className="ck-stack">
        <div className={`ck-done ck-ticket${called ? " called" : ""}`} role="status" aria-live="polite">
          <p className="ck-code-label">{tr(T.waitNo, lang)}</p>
          <p className="ck-code tabular">{String(ticket.no).padStart(2, "0")}</p>
          {called ? (
            <p className="ck-ticket-msg">{tr(T.waitCalled, lang)}</p>
          ) : st ? (
            <p className="ck-ticket-msg">{st.ahead === 0 ? tr(T.waitNext, lang) : tr(T.waitAhead, lang, { n: st.ahead })}</p>
          ) : null}
          <p className="ck-muted">{tr(kiosk ? T.waitKeepKiosk : T.waitKeep, lang)}</p>
        </div>
        {!kiosk && (
          <>
            <button type="button" className="btn btn-block" onClick={onRead}>{tr(T.waitRead, lang)}</button>
            {otherCard}
            <button type="button" className="cb-undo ck-cancel" onClick={cancel}>{tr(T.waitCancel, lang)}</button>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="ck-stack">
      <div className="ck-card ck-hello ck-full">
        <p className="ck-eyebrow2" data-text="FULL · WAITLIST" />
        <h1>{tr(T.fullTitle, lang)}</h1>
        <p className="ck-lead">{tr(T.fullLead, lang, { other: `${other.name} CAT CAFE` })}</p>
      </div>

      <div className="ck-card ck-waitform">
        <h2>{tr(T.waitTitle, lang)}</h2>
        <label className="ck-field">
          <span>{tr(T.waitPhone, lang)}</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete={kiosk ? "off" : "tel"}
            value={phone}
            onChange={(e) => setPhone(e.target.value.slice(0, 20))}
            placeholder="0912 345 678"
          />
        </label>
        <p className="ck-small">{tr(T.waitPhoneHint, lang)}</p>
        <div className="ck-field ck-field-row">
          <span>{tr(T.waitSize, lang)}</span>
          <div className="ck-stepper" role="group" aria-label={tr(T.waitSize, lang)}>
            <button type="button" onClick={() => setSize(Math.max(1, size - 1))} disabled={size <= 1} aria-label="−">−</button>
            <output aria-live="polite" className="tabular">{size}</output>
            <button type="button" onClick={() => setSize(Math.min(20, size + 1))} aria-label="+">+</button>
          </div>
        </div>
        {err && <p className="ck-err" role="alert">{err}</p>}
        <button type="button" className="btn btn-block" onClick={join} disabled={sending || !phone.trim()}>
          {sending ? tr(T.sending, lang) : tr(T.waitSubmit, lang)}
        </button>
      </div>

      {otherCard}

      <button type="button" className="ck-textlink" onClick={onRead}>{tr(T.waitSkip, lang)}</button>
    </section>
  );
}
