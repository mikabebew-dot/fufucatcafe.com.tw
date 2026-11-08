import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { BRANDS, brandOf, isBrand } from "@/lib/constants";
import { siteUrl } from "@/sanity/env";
import { PrintButton } from "./PrintButton";

/** 可列印的 QR 立牌：掃描後開啟該店的入場確認頁 */
export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.id }));
}

export default async function QrPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const b = brandOf(brand);
  const url = `${siteUrl.replace(/\/$/, "")}/checkin/${brand}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#2b2523", light: "#ffffff" } });
  return (
    <div className="qr-page" data-brand={brand}>
      <div className="qr-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.logo} alt={b.name} width={72} height={72} style={{ borderRadius: "50%" }} />
        <h1>入場前，請掃描確認</h1>
        <p className="qr-langs">Scan before you enter・入店前にスキャン・입장 전에 스캔해 주세요</p>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="qr-langs">費用・飲品方案・和貓咪的約定，1 分鐘看完</p>
        <p className="qr-url">{url}</p>
        <PrintButton />
      </div>
    </div>
  );
}
