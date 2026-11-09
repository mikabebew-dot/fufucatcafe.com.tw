import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkinLogo } from "@/lib/checkin/content";
import QRCode from "qrcode";
import { BRANDS, brandOf, isBrand } from "@/lib/constants";
import { siteUrl } from "@/sanity/env";
import { PrintButton } from "../../qr/PrintButton";

/** 店內桌卡／牆面用的 QR：掃描後開啟「今天在店裡等家的孩子」 */
export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: isBrand(brand) ? `${brandOf(brand).name}｜貓咪介紹 QR 卡` : "貓咪介紹 QR 卡" };
}

export default async function FosterQrPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const b = brandOf(brand);
  const origin = siteUrl.includes("localhost") ? "https://fufucatcafe.com.tw" : siteUrl.replace(/\/$/, "");
  const url = `${origin}/checkin/${brand}/cats`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2b2523", light: "#ffffff" } });
  const fufu = brand === "fufu";
  return (
    <div className="qr-page" data-brand={brand}>
      <div className="qr-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={checkinLogo(brand, b.logo)} alt={b.name} width={72} height={72} style={{ borderRadius: "50%" }} />
        <h1>{fufu ? "認識 FUFU 的貓咪" : "今天在店裡等家的孩子"}</h1>
        <p className="qr-langs">
          {fufu ? "Meet FUFU's cats・FUFUの猫たち・FUFU의 고양이들" : "Meet the cats waiting for a home・おうちを待つ猫たち・가족을 기다리는 아이들"}
        </p>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="qr-langs">{fufu ? "掃描認識牠們的名字和個性" : "掃描認識牠們，想多了解歡迎問店員"}</p>
        <p className="qr-url">{url}</p>
        <PrintButton />
      </div>
    </div>
  );
}
