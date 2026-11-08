"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Img } from "@/lib/types";
import { SanityImage } from "./SanityImage";
import { PlainText } from "@/components/PlainText";

export type HeroSlide = {
  _key: string;
  heading?: string | null;
  subheading?: string | null;
  link?: string | null;
  image: Img;
  mobileImage?: Img;
};

/** 首頁主視覺：手指可左右滑；自動輪播（使用者偏好減少動態時停用） */
export function HeroCarousel({ slides, autoplaySeconds = 6 }: { slides: HeroSlide[]; autoplaySeconds?: number }) {
  const t = useTranslations("common");
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const n = (i + slides.length) % slides.length;
      track.scrollTo({ left: n * track.clientWidth, behavior: "smooth" });
    },
    [slides.length],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!autoplaySeconds || slides.length < 2 || paused || reduce) return;
    const id = setTimeout(() => goTo(index + 1), autoplaySeconds * 1000);
    return () => clearTimeout(id);
  }, [index, paused, autoplaySeconds, slides.length, goTo]);

  if (!slides.length) return null;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t("hero")}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-track" ref={trackRef}>
        {slides.map((s, i) => {
          const body = (
            <>
              <div className={`hero-media ${s.mobileImage?.asset ? "has-mobile" : ""}`}>
                <div className="hero-desktop">
                  <SanityImage image={s.image} fill sizes="100vw" priority={i === 0} />
                </div>
                {s.mobileImage?.asset && (
                  <div className="hero-mobile">
                    <SanityImage image={s.mobileImage} fill sizes="100vw" priority={i === 0} />
                  </div>
                )}
              </div>
              {(s.heading || s.subheading) && (
                <div className="hero-caption">
                  {s.heading && <h2>{s.heading}</h2>}
                  {s.subheading && <p><PlainText text={s.subheading} /></p>}
                </div>
              )}
            </>
          );
          return (
            <div key={s._key} className="hero-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`}>
              {s.link ? (
                s.link.startsWith("/") ? (
                  <Link href={s.link}>{body}</Link>
                ) : (
                  <a href={s.link} target="_blank" rel="noopener noreferrer">{body}</a>
                )
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>
      {slides.length > 1 && (
        <div className="hero-controls">
          <button type="button" onClick={() => goTo(index - 1)} aria-label={t("prev")}>‹</button>
          <div className="hero-dots">
            {slides.map((s, i) => (
              <button key={s._key} type="button" aria-label={t("slide", { n: i + 1 })} aria-current={i === index} onClick={() => goTo(i)} />
            ))}
          </div>
          <button type="button" onClick={() => goTo(index + 1)} aria-label={t("next")}>›</button>
        </div>
      )}
    </section>
  );
}
