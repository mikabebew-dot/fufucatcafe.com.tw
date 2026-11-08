"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CheckinData } from "@/lib/checkin/data";
import {
  LANGS, LANG_LABEL, LOCALE_PREFIX, PRICE_CAP_MIN, RULES, SPEECH_LANG, T,
  isLang, perPerson, tr, type Lang,
} from "@/lib/checkin/content";

type Result = { code: string; at: string; short: number; long: number; online: boolean };

const STORE_KEY = (brand: string) => `checkin:${brand}:result`;
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

function detectLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    if (isLang(q)) return q;
    const n = (navigator.language || "").toLowerCase();
    if (n.startsWith("ja")) return "ja";
    if (n.startsWith("ko")) return "ko";
    if (n.startsWith("zh")) return "zh";
    if (n) return "en";
  } catch {
    /* 讀不到就用中文 */
  }
  return "zh";
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="ck-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label="−">−</button>
      <output aria-live="polite" className="tabular">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} aria-label="+">+</button>
    </div>
  );
}

export function CheckinFlow({ data, brandName, logo }: { data: CheckinData; brandName: string; logo: string }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [step, setStep] = useState(0);
  const [short, setShort] = useState(0);
  const [long, setLong] = useState(0);
  const [minutes, setMinutes] = useState(60);
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [kiosk, setKiosk] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // 語言：網址 ?lang= 或瀏覽器語言；?kiosk=1 是櫃檯平板模式（完成後可換下一組）
  useEffect(() => {
    setLang(detectLang());
    try {
      const isKiosk = new URLSearchParams(window.location.search).get("kiosk") === "1";
      setKiosk(isKiosk);
      // 手機重新整理後仍保留確認畫面（櫃檯平板不保留，每次都從頭開始）
      const saved = isKiosk ? null : sessionStorage.getItem(STORE_KEY(data.brand));
      if (saved) {
        const r = JSON.parse(saved) as Result;
        if (Date.now() - new Date(r.at).getTime() < 6 * 3600_000) {
          setResult(r);
          setStep(3);
        }
      }
    } catch {
      /* 無痕模式等情況讀不到也沒關係 */
    }
  }, [data.brand]);

  // 有些瀏覽器的語音清單要等一下才會載入
  useEffect(() => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.getVoices();
      synth.addEventListener?.("voiceschanged", () => synth.getVoices());
    } catch {
      /* 不支援就略過 */
    }
  }, []);

  useEffect(() => {
    setNoVoice(false);
  }, [lang, step]);

  useEffect(() => {
    document.documentElement.lang = { zh: "zh-Hant-TW", en: "en", ja: "ja", ko: "ko" }[lang];
  }, [lang]);

  const stopSpeech = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* 不支援就略過 */
    }
    setSpeaking(false);
  }, []);

  // 換頁或換語言時停止朗讀並回到頂端
  useEffect(() => {
    stopSpeech();
    window.scrollTo({ top: 0 });
  }, [step, lang, stopSpeech]);

  // 依語言挑選裝置上的語音：只設定 lang 時，有些平板會用預設的中文語音唸外文
  const pickVoice = (l: Lang) => {
    const voices = window.speechSynthesis?.getVoices() ?? [];
    const want = SPEECH_LANG[l].toLowerCase();
    const base = want.split("-")[0];
    const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-");
    const same = voices.filter((v) => norm(v).startsWith(base));
    if (base === "zh") {
      return same.find((v) => /tw|hant/.test(norm(v))) ?? same.find((v) => /hk/.test(norm(v))) ?? same[0];
    }
    return same.find((v) => norm(v) === want) ?? same[0];
  };

  const speak = () => {
    if (speaking) return stopSpeech();
    setNoVoice(false);
    const synth = window.speechSynthesis;
    // 只朗讀內容本身，不唸「聆聽本頁」按鈕
    const text = mainRef.current?.querySelector("section")?.innerText;
    if (!synth || !text) return;
    const voice = pickVoice(lang);
    if (!voice) {
      setNoVoice(true);
      return;
    }
    // 分段朗讀：Chrome 一次唸太長會中途停止
    const parts = text
      .replace(/[−＋+]/g, " ")
      .replace(/([。！？.!?])\s*/g, "$1\n")
      .split(/\n+/)
      .map((t) => t.trim())
      .filter(Boolean);
    synth.cancel();
    parts.forEach((t, i) => {
      const u = new SpeechSynthesisUtterance(t);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      if (i === parts.length - 1) u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    });
    setSpeaking(true);
  };

  const party = short + long;
  const per = perPerson(minutes, data.per10);
  const cap = data.per10 * (PRICE_CAP_MIN / 10);
  const href = (path: string) => `${LOCALE_PREFIX[lang]}${path}`;

  const submit = async () => {
    setSending(true);
    let r: Result;
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: data.brand, lang, short, long }),
      });
      const j = (await res.json()) as { saved?: boolean; code?: string; at?: string };
      if (!res.ok || !j.saved || !j.code) throw new Error("not saved");
      r = { code: j.code, at: j.at ?? new Date().toISOString(), short, long, online: true };
    } catch {
      // 網路不通時仍讓客人完成，畫面標示「未連線」，請店員人工核對
      r = { code: String(1000 + Math.floor(Math.random() * 9000)), at: new Date().toISOString(), short, long, online: false };
    }
    try {
      if (!kiosk) sessionStorage.setItem(STORE_KEY(data.brand), JSON.stringify(r));
    } catch {
      /* 存不了就只留在畫面上 */
    }
    setResult(r);
    setSending(false);
    setStep(3);
  };

  const reset = useCallback(() => {
    try {
      sessionStorage.removeItem(STORE_KEY(data.brand));
    } catch {
      /* 略過 */
    }
    setResult(null);
    setShort(0);
    setLong(0);
    setAgree(false);
    setMinutes(60);
    setStep(0);
  }, [data.brand]);

  // 櫃檯平板：完成畫面 2 分鐘後自動回到開頭
  useEffect(() => {
    if (!kiosk || step !== 3) return;
    const t = setTimeout(reset, 120_000);
    return () => clearTimeout(t);
  }, [kiosk, step, reset]);


  const pricePoints = useMemo(() => T.pricePoints[lang].map((s) => s.replace("{capMin}", String(PRICE_CAP_MIN))), [lang]);

  const LangSwitch = ({ big = false }: { big?: boolean }) => (
    <div className={big ? "ck-langs ck-langs-big" : "ck-langs"} role="radiogroup" aria-label={tr(T.chooseLang, lang)}>
      {LANGS.map((l) => (
        <button key={l} type="button" role="radio" aria-checked={lang === l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} lang={l}>
          {big ? LANG_LABEL[l] : { zh: "中", en: "EN", ja: "日", ko: "한" }[l]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="ck" data-brand={data.brand}>
      <header className="ck-top">
        <div className={step > 0 ? "ck-brand compact" : "ck-brand"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={36} height={36} />
          <span>{brandName}</span>
        </div>
        {step > 0 && step < 3 && <span className="ck-progress tabular">{tr(T.stepOf, lang, { n: step })}</span>}
        {step > 0 && <LangSwitch />}
      </header>
      {step > 0 && step < 3 && (
        <div className="ck-bar" aria-hidden="true"><span style={{ width: `${(step / 3) * 100}%` }} /></div>
      )}

      <main ref={mainRef} className="ck-main">
        {step > 0 && step < 3 && (
          <button type="button" className="ck-listen" onClick={speak} aria-pressed={speaking}>
            <span aria-hidden="true">{speaking ? "■" : "▶"}</span> {tr(speaking ? T.stop : T.listen, lang)}
          </button>
        )}
        {noVoice && <p className="ck-novoice" role="status">{tr(T.noVoice, lang)}</p>}

        {step === 0 && (
          <section className="ck-welcome">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ck-hero-logo" src={logo} alt={brandName} width={96} height={96} />
            <p className="ck-eyebrow">{tr(T.welcome, lang)}</p>
            <h1>{brandName}</h1>
            <p className="ck-lead">{tr(T.intro, lang)}</p>
            <LangSwitch big />
            <p className="ck-note">{tr(T.notCharged, lang)}</p>
          </section>
        )}

        {step === 1 && (
          <section className="ck-stack">
            <h1>{tr(T.priceTitle, lang)}</h1>
            <div className="ck-card ck-price">
              <p className="ck-price-head">{tr(T.priceHead, lang, { p: data.per10, cap })}</p>
              <ul className="ck-points">
                {pricePoints.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>

            <h2>{tr(T.planTitle, lang)}</h2>
            <p className="ck-muted">{tr(T.planHint, lang)}</p>
            <div className="ck-plans">
              <div className={`ck-plan${short ? " on" : ""}`}>
                <div className="ck-plan-head">
                  <div>
                    <p className="ck-plan-name">{tr(T.shortName, lang)}</p>
                    <p className="ck-plan-when">{tr(T.shortWhen, lang)}</p>
                  </div>
                  <Stepper value={short} onChange={setShort} label={tr(T.shortName, lang)} />
                </div>
                <p>{tr(T.shortDrinks, lang, { d: data.shortDrinks[lang] })}</p>
                <p className="ck-small">{tr(T.shortUpgrade, lang)}</p>
              </div>
              <div className={`ck-plan${long ? " on" : ""}`}>
                <div className="ck-plan-head">
                  <div>
                    <p className="ck-plan-name">{tr(T.longName, lang)}</p>
                    <p className="ck-plan-when">{tr(T.longWhen, lang)}</p>
                  </div>
                  <Stepper value={long} onChange={setLong} label={tr(T.longName, lang)} />
                </div>
                <p>{tr(T.longDrinks, lang)}</p>
                <p className="ck-small">{tr(T.longMin, lang, { v: data.longMin })}</p>
              </div>
            </div>

            <div className="ck-card ck-calc">
              <div className="ck-calc-row">
                <label htmlFor="ck-min">{tr(T.calcTitle, lang)}</label>
                <span className="tabular">{minutes >= PRICE_CAP_MIN ? tr(T.calcStayCap, lang, { m: PRICE_CAP_MIN }) : tr(T.calcStay, lang, { m: minutes })}</span>
              </div>
              <input id="ck-min" type="range" min={10} max={PRICE_CAP_MIN} step={10} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
              <div className="ck-calc-row ck-calc-out tabular">
                <span>{tr(T.calcPer, lang, { v: per })}</span>
                {party > 1 && <strong>{tr(T.calcTotal, lang, { n: party, v: per * party })}</strong>}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="ck-stack">
            <h1>{tr(T.rulesTitle, lang)}</h1>
            <p className="ck-muted">{tr(T.rulesLead, lang)}</p>
            <ol className="ck-rules">
              {RULES.map((r, i) => (
                <li key={i}>
                  <span className="ck-num" aria-hidden="true">{i + 1}</span>
                  <div>
                    <p className="ck-rule-title">{tr(r.title, lang)}</p>
                    <p className="ck-muted">{tr(r.body, lang)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="ck-card ck-notes">
              <p>{tr(T.scratch, lang)}</p>
              {data.entryNote && <p>{data.entryNote[lang]}</p>}
            </div>
            <label className="ck-agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>{tr(T.agree, lang)}</span>
            </label>
          </section>
        )}

        {step === 3 && result && (
          <section className="ck-stack">
            <div className="ck-done" role="status">
              <div className="ck-check" aria-hidden="true">✓</div>
              <h1>{tr(T.doneTitle, lang)}</h1>
              <p className="ck-done-show">{tr(T.doneShow, lang)}</p>
              <p className="ck-code-label">{tr(T.code, lang)}</p>
              <p className="ck-code tabular">{result.code}</p>
              <dl className="ck-sum">
                {result.short > 0 && (<><dt>{tr(T.shortName, lang)}</dt><dd className="tabular">{result.short} {tr(T.people, lang)}</dd></>)}
                {result.long > 0 && (<><dt>{tr(T.longName, lang)}</dt><dd className="tabular">{result.long} {tr(T.people, lang)}</dd></>)}
                <dt>{tr(T.confirmedAt, lang)}</dt>
                <dd className="tabular">{fmtTime(result.at)}{!result.online && " ・ offline"}</dd>
              </dl>
            </div>

            {/* 手機版只留一行連結，入座後再看；櫃檯平板完全不顯示，避免客人停在帶位區 */}
            {!kiosk && data.cats.length > 0 && (
              <a className="ck-foster-link" href={`/checkin/${data.brand}/cats${lang === "zh" ? "" : `?lang=${lang}`}`}>
                {tr(data.brand === "fufu" ? T.fosterLinkFufu : T.fosterLink, lang)} →
              </a>
            )}

            {!kiosk && (
              <button type="button" className="btn btn-ghost btn-block ck-again" onClick={reset}>{tr(T.again, lang)}</button>
            )}
          </section>
        )}
      </main>

      {step === 3 && kiosk && (
        <footer className="ck-foot">
          <button type="button" className="btn btn-block ck-cta" onClick={reset}>{tr(T.restart, lang)}</button>
        </footer>
      )}
      {step < 3 && (
        <footer className="ck-foot">
          {step === 0 && <button type="button" className="btn btn-block ck-cta" onClick={() => setStep(1)}>{tr(T.start, lang)}</button>}
          {step === 1 && (
            <div className="btn-row ck-row">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>{tr(T.back, lang)}</button>
              <button type="button" className="btn" onClick={() => setStep(2)} disabled={party < 1}>
                {party < 1 ? tr(T.needPeople, lang) : `${tr(T.next, lang)}・${tr(T.partyTotal, lang, { n: party })}`}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="btn-row ck-row">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>{tr(T.back, lang)}</button>
              <button type="button" className="btn" onClick={submit} disabled={!agree || sending}>
                {sending ? tr(T.sending, lang) : tr(T.finish, lang)}
              </button>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
