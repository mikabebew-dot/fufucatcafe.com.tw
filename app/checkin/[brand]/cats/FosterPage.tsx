"use client";

import { useEffect, useRef, useState } from "react";
import type { CheckinCat } from "@/lib/checkin/data";
import { LANGS, LOCALE_PREFIX, T, isLang, tr, type Lang } from "@/lib/checkin/content";

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

/** 統計：瀏覽（view）、點某隻貓（網址代稱）、點認養流程（page） */
function track(brand: string, cat: string) {
  try {
    const body = JSON.stringify({ brand, cat });
    if (!navigator.sendBeacon?.("/api/checkin/adopt", new Blob([body], { type: "text/plain" }))) {
      fetch("/api/checkin/adopt", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* 統計失敗不影響客人 */
  }
}

export function FosterPage({ brand, brandName, logo, cats }: { brand: string; brandName: string; logo: string; cats: CheckinCat[] }) {
  const [lang, setLang] = useState<Lang>("zh");
  const viewed = useRef(false);

  useEffect(() => {
    setLang(detectLang());
    if (!viewed.current) {
      viewed.current = true;
      track(brand, "view");
    }
  }, [brand]);

  useEffect(() => {
    document.documentElement.lang = { zh: "zh-Hant-TW", en: "en", ja: "ja", ko: "ko" }[lang];
  }, [lang]);

  const href = (path: string) => `${LOCALE_PREFIX[lang]}${path}`;

  return (
    <div className="ck ck-foster-page" data-brand={brand}>
      <header className="ck-top">
        <div className="ck-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={36} height={36} />
          <span>{brandName}</span>
        </div>
        <div className="ck-langs" role="radiogroup" aria-label={tr(T.chooseLang, lang)}>
          {LANGS.map((l) => (
            <button key={l} type="button" role="radio" aria-checked={lang === l} className={lang === l ? "on" : ""} onClick={() => setLang(l)} lang={l}>
              {{ zh: "中", en: "EN", ja: "日", ko: "한" }[l]}
            </button>
          ))}
        </div>
      </header>

      <main className="ck-main">
        <div className="ck-foster-head">
          <h1>{tr(brand === "fufu" ? T.fosterPageTitleFufu : T.fosterPageTitle, lang)}</h1>
          <p className="ck-muted">{tr(brand === "fufu" ? T.fosterLeadFufu : T.fosterLead, lang)}</p>
        </div>
        <div className="ck-cats-block">
          <ul className="ck-cats">
            {cats.map((c) => (
              <li key={c.slug}>
                <a href={href(`/${brand}/cats/${c.slug}`)} onClick={() => brand === "nukunuku" && track(brand, c.slug)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.photo && <img src={c.photo} alt="" width={180} height={180} loading="lazy" />}
                  <span className="ck-cat-name">{c.name[lang]}{c.status === "matching" && <em>{tr(T.matching, lang)}</em>}</span>
                  {c.traits && <span className="ck-cat-traits">{c.traits[lang].slice(0, 2).join("・")}</span>}
                </a>
              </li>
            ))}
          </ul>
          {brand === "fufu" ? (
            <p className="ck-muted">{tr(T.fufuAsk, lang)}</p>
          ) : (
            <>
              <p className="ck-muted">{tr(T.fosterAsk, lang)}</p>
              <a className="btn btn-block" href={href("/nukunuku/adoption")} onClick={() => track(brand, "page")}>
                {tr(T.adoptHow, lang)}
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
