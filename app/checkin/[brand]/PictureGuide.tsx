"use client";

import { useEffect, useState } from "react";
import { MORE_RULES, PIC_RULES, T, tr, type Lang } from "@/lib/checkin/content";
import type { BrandId } from "@/lib/constants";
import { KidsGuide } from "./KidsGuide";

/**
 * 圖片版入場說明（從第 2 頁的按鈕打開）：Canva 店規插圖，點圖可放大。
 * NUKUNUKU 另有小朋友版（一次一張、中英對照短句、蓋貓掌印）。
 * 正式的約定與勾選同意仍在第 3 頁的文字版。
 */
export function PictureGuide({ brand, lang, onClose }: { brand: BrandId; lang: Lang; onClose: () => void }) {
  const rules = PIC_RULES[brand];
  const [zoom, setZoom] = useState<number | null>(null);
  const [kids, setKids] = useState(false);
  const [kidsDone, setKidsDone] = useState(false);
  const isKids = brand === "nukunuku"; // NUKUNUKU 是小朋友版，FUFU 是「一張一張看」

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom !== null) setZoom(null);
      else if (!kids) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, zoom, kids]);

  return (
    <div className="ck-pg" data-brand={brand} role="dialog" aria-modal="true" aria-label={tr(T.picGuideTitle, lang)}>
      <div className="ck-pg-top">
        <p className="ck-pg-title">{tr(T.picGuideTitle, lang)}</p>
        <button type="button" className="ck-kids-x" onClick={onClose} aria-label={tr(T.close, lang)}>×</button>
      </div>

      <div className="ck-pg-body">
        {(
          <button type="button" className={`ck-kids-open${kidsDone ? " done" : ""}`} onClick={() => setKids(true)}>
            <span className="ck-kids-open-icon" aria-hidden="true">{kidsDone ? "✓" : isKids ? "🧒" : "🐾"}</span>
            <span>
              <strong>{tr(isKids ? T.kidsOpen : T.stepOpen, lang)}</strong>
              <small>{kidsDone ? tr(isKids ? T.kidsDoneTag : T.stepDoneTag, lang) : tr(isKids ? T.kidsOpenSub : T.stepOpenSub, lang)}</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        )}

        {/* 圖上已有中英文，其他語言在圖下顯示翻譯 */}
        <ol className="ck-pics">
          {rules.map((r, i) => (
            <li key={i} className={r.strong ? "ck-pic-strong" : undefined}>
              <button type="button" onClick={() => setZoom(i)} aria-label={tr(r.title, lang)}>
                {r.strong && <span className="ck-rule-key">{tr(T.ruleKey, lang)}</span>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt={tr(r.title, lang)} loading={i < 3 ? "eager" : "lazy"} />
                {lang !== "zh" && lang !== "en" && <span className="ck-pic-cap">{tr(r.title, lang)}</span>}
              </button>
            </li>
          ))}
        </ol>
        <p className="ck-small ck-pic-hint">{tr(T.picHint, lang)}</p>

        <h2>{tr(T.moreTitle, lang)}</h2>
        <ul className="ck-more">
          {MORE_RULES[brand].map((r, i) => (
            <li key={i}>
              <p className="ck-rule-title">{tr(r.title, lang)}</p>
              <p className="ck-muted">{tr(r.body, lang).replace(/\*\*/g, "")}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="ck-pg-foot">
        <button type="button" className="btn btn-block ck-cta" onClick={onClose}>{tr(T.picGuideBack, lang)} ›</button>
      </div>

      {zoom !== null && (
        <div className="ck-zoom" role="dialog" aria-modal="true" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rules[zoom].img} alt={tr(rules[zoom].title, lang)} />
          <p>{tr(rules[zoom].title, lang)}</p>
          <button type="button" className="btn btn-ghost">{tr(T.close, lang)}</button>
        </div>
      )}
      {kids && <KidsGuide rules={rules} variant={isKids ? "kids" : "step"} onClose={() => setKids(false)} onDone={() => setKidsDone(true)} />}
    </div>
  );
}
