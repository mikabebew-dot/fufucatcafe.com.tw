"use client";

import { useEffect, useState } from "react";
import { T, tr, type L10n, type Lang, type PicRule } from "@/lib/checkin/content";

/**
 * 小朋友版入場說明（NUKUNUKU）：一次一張大圖＋一句簡單的話，
 * 按「我會做到！」蓋一個貓掌印，6 張看完後提醒「要和爸爸媽媽待在同一層樓」。
 */
export function KidsGuide({ rules, lang, onClose, onDone }: { rules: PicRule[]; lang: Lang; onClose: () => void; onDone: () => void }) {
  const [i, setI] = useState(0);
  const done = i >= rules.length;
  const r = rules[Math.min(i, rules.length - 1)];

  // 打開時鎖住背景捲動，Esc 可以關閉
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const next = () => {
    if (i + 1 >= rules.length) onDone();
    setI(i + 1);
  };

  return (
    <div className="ck-kids" role="dialog" aria-modal="true" aria-label={tr(T.kidsTitle, lang)}>
      <div className="ck-kids-top">
        <p className="ck-kids-title">{tr(T.kidsTitle, lang)}</p>
        <button type="button" className="ck-kids-x" onClick={onClose} aria-label={tr(T.close, lang)}>×</button>
      </div>

      <ol className="ck-kids-paws" aria-label={`${Math.min(i, rules.length)} / ${rules.length}`}>
        {rules.map((_, k) => (
          <li key={k} className={k < i ? "on" : k === i ? "now" : ""} aria-hidden="true">🐾</li>
        ))}
      </ol>

      {!done ? (
        <div className="ck-kids-card" key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.img} alt={tr(r.title, lang)} />
          <p className="ck-kids-line">{tr((r.kid ?? r.title) as L10n, lang)}</p>
        </div>
      ) : (
        <div className="ck-kids-card ck-kids-done">
          <p className="ck-kids-badge" aria-hidden="true">🐾🐾🐾<br />🐾🐾🐾</p>
          <p className="ck-kids-big">{tr(T.kidsDoneTitle, lang)}</p>
          <p className="ck-kids-line">{tr(T.kidsDoneBody, lang)}</p>
        </div>
      )}

      <div className="ck-kids-foot">
        {!done ? (
          <>
            {i > 0 && <button type="button" className="btn btn-ghost" onClick={() => setI(i - 1)}>‹</button>}
            <button type="button" className="btn ck-kids-do" onClick={next}>{tr(T.kidsDo, lang)} 🐾</button>
          </>
        ) : (
          <button type="button" className="btn ck-kids-do" onClick={onClose}>{tr(T.kidsBack, lang)} ›</button>
        )}
      </div>
    </div>
  );
}
