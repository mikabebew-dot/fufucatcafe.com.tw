"use client";

import { useTranslations } from "next-intl";
import { useIsPresentationTool } from "next-sanity/hooks";

/** 管理員直接用瀏覽器開啟預覽模式時顯示；在後台「預覽」工具中不顯示 */
export function DraftModeBar() {
  const t = useTranslations("common");
  const inPresentation = useIsPresentationTool();
  if (inPresentation !== false) return null;
  return (
    <div className="draft-bar" role="status">
      {t("previewMode")}
      <a href="/api/draft-mode/disable">{t("exitPreview")}</a>
    </div>
  );
}
