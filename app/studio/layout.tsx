import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { metadata as studioMetadata } from "next-sanity/studio";

/**
 * 後台可「加入主畫面」：手機上像 App 一樣全螢幕開啟。
 * iPhone：Safari 分享 →「加入主畫面」；Android：Chrome 選單 →「安裝應用程式」。
 */
export const metadata: Metadata = {
  ...(studioMetadata as Metadata),
  title: "FUFU × NUKUNUKU 後台",
  manifest: "/admin.webmanifest",
  applicationName: "貓咪後台",
  appleWebApp: { capable: true, title: "貓咪後台", statusBarStyle: "default" },
  icons: { icon: "/icons/admin-64.png", apple: "/icons/admin-180.png" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#4f7a72" };

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
