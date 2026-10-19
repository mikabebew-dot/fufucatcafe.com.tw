import type { ReactNode } from "react";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
