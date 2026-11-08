import { Jost, Noto_Sans_TC } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "./checkin.css";

/**
 * 入場確認系統（/checkin）有自己的 <html>：不顯示官網頁首頁尾，像櫃檯平板上的獨立工具。
 */
const sans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-noto-sans", display: "swap", preload: false });
const jost = Jost({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: "入場確認｜FUFU × NUKUNUKU",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#faf9f7" };

export default function CheckinLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant-TW" className={`${sans.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
