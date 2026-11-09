import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkinLogo } from "@/lib/checkin/content";
import { brandOf, isBrand } from "@/lib/constants";
import { loadCheckin } from "@/lib/checkin/data";
import { CheckinFlow } from "./CheckinFlow";

// 後台改了貓咪或價格，最多 60 秒後入場頁就會更新
export const revalidate = 60;

export function generateStaticParams() {
  return [{ brand: "fufu" }, { brand: "nukunuku" }];
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: isBrand(brand) ? `${brandOf(brand).name}｜入場確認` : "入場確認" };
}

export default async function CheckinPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const data = await loadCheckin(brand);
  const b = brandOf(brand);
  return <CheckinFlow data={data} brandName={b.name} logo={checkinLogo(brand, b.logo)} />;
}
