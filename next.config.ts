import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // 圖片由 Sanity 圖片 CDN 依需求即時產生各尺寸（見 components/SanityImage.tsx）
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        // 後台不讓搜尋引擎收錄、也不允許被其他網站嵌入
        source: "/studio/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
