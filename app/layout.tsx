import type { ReactNode } from "react";

/**
 * 根版面只是轉接：官網的 <html> 在 app/[locale]/layout.tsx（依語言設定 lang），
 * 後台的 <html> 在 app/studio/layout.tsx。
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
