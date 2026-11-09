import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { checkinLogo } from "@/lib/checkin/content";
import { brandOf, isBrand } from "@/lib/constants";
import { loadCheckin } from "@/lib/checkin/data";
import { FosterPage } from "./FosterPage";

/** 店內桌卡／牆面 QR 開啟的頁面：「今天在店裡等家的孩子」（讀後台 NUKUNUKU 可認養與媒合中的貓） */
export const revalidate = 60;

export function generateStaticParams() {
  return [{ brand: "fufu" }, { brand: "nukunuku" }];
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: isBrand(brand) ? `${brandOf(brand).name}｜貓咪介紹` : "貓咪介紹" };
}

export default async function CatsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const data = await loadCheckin(brand);
  const b = brandOf(brand);
  return <FosterPage brand={brand} brandName={b.name} logo={checkinLogo(brand, b.logo)} cats={data.cats} />;
}
