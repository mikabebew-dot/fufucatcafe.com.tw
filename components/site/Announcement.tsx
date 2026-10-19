"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

/** 全站公告列；超過「自動下架時間」就不顯示 */
export function Announcement({ text, link, until }: { text?: string | null; link?: string | null; until?: string | null }) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (until && new Date(until).getTime() < Date.now()) setExpired(true);
  }, [until]);
  if (!text || expired) return null;
  const inner = <span>{text}</span>;
  return (
    <aside className="announce">
      <div className="wrap">
        {link ? (
          link.startsWith("/") ? <Link href={link}>{inner} →</Link> : <a href={link} target="_blank" rel="noopener noreferrer">{inner} ↗</a>
        ) : (
          inner
        )}
      </div>
    </aside>
  );
}
