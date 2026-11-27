"use client";

import { useEffect, useState } from "react";
import { T, type L10n, type PicRule } from "@/lib/checkin/content";

/** 小朋友版固定中英對照（不跟著介面語言） */
function Both({ t, className }: { t: Partial<L10n>; className: string }) {
  return (
    <p className={className}>
      <span lang="zh-Hant">{t.zh}</span>
      {t.en && <span lang="en" className="ck-kids-en">{t.en}</span>}
    </p>
  );
}

/**
 * 小朋友版入場說明（NUKUNUKU）：主要靠大圖，一張配一句很短的中英文，
 * 按「我會做到！」蓋一個貓掌印，6 張看完後提醒「要和爸爸媽媽待在同一層樓」。
 */
export function KidsGuide({ rules, onClose, onDone }: { rules: PicRule[]; onClose: () => void; onDone: () => void }) {
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
    <div className="ck-kids" role="dialog" aria-modal="true" aria-label={`${T.kidsTitle.zh} ${T.kidsTitle.en}`}>
      <div className="ck-kids-top">
        <Both t={T.kidsTitle} className="ck-kids-title" />
        <button type="button" className="ck-kids-x" onClick={onClose} aria-label={`${T.close.zh} ${T.close.en}`}>×</button>
      </div>

      <ol className="ck-kids-paws" aria-label={`${Math.min(i, rules.length)} / ${rules.length}`}>
        {rules.map((_, k) => (
          <li key={k} className={k < i ? "on" : k === i ? "now" : ""} aria-hidden="true">🐾</li>
        ))}
      </ol>

      {!done ? (
        <div className="ck-kids-card" key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.img} alt={`${r.title.zh} ${r.title.en}`} />
          <Both t={r.kid ?? r.title} className="ck-kids-line" />
        </div>
      ) : (
        <div className="ck-kids-card ck-kids-done">
          <p className="ck-kids-badge" aria-hidden="true">🐾🐾🐾<br />🐾🐾🐾</p>
          <Both t={T.kidsDoneTitle} className="ck-kids-big" />
          <Both t={T.kidsDoneBody} className="ck-kids-line" />
        </div>
      )}

      <div className="ck-kids-foot">
        {!done ? (
          <>
            {i > 0 && <button type="button" className="btn btn-ghost" onClick={() => setI(i - 1)} aria-label="Back">‹</button>}
            <button type="button" className="btn ck-kids-do" onClick={next}>{T.kidsDo.zh} {T.kidsDo.en} 🐾</button>
          </>
        ) : (
          <button type="button" className="btn ck-kids-do" onClick={onClose}>{T.kidsBack.zh}・{T.kidsBack.en} ›</button>
        )}
      </div>
    </div>
  );
}
