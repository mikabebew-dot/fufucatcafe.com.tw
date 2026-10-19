"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { openState, type OpenState } from "@/lib/hours";
import type { HoursRow, SpecialDate } from "@/lib/types";

/** 依台北時間即時顯示「營業中／今日公休」；在瀏覽器計算，避免快取造成過期狀態 */
export function OpenStatus({ hours, special }: { hours?: HoursRow[]; special?: SpecialDate[] }) {
  const t = useTranslations("status");
  const [state, setState] = useState<OpenState | null>(null);
  useEffect(() => {
    const tick = () => setState(openState(hours, special));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours, special]);

  if (!state || state.kind === "unknown") return <span className="open-pill" aria-hidden="true" style={{ visibility: "hidden" }}>—</span>;
  if (state.kind === "open") return <span className="open-pill is-open">{t("openUntil", { time: state.until })}</span>;
  if (state.kind === "before") return <span className="open-pill is-closed">{t("opensAt", { time: state.opens })}</span>;
  if (state.kind === "after") return <span className="open-pill is-closed">{t("closedNow")}</span>;
  return <span className="open-pill is-closed">{t("closedToday")}</span>;
}
