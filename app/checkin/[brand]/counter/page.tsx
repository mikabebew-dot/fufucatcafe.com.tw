import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRANDS, brandOf, isBrand } from "@/lib/constants";
import { loadCheckin } from "@/lib/checkin/data";
import { CounterBoard } from "./CounterBoard";

export const revalidate = 60;

export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: isBrand(brand) ? `${brandOf(brand).name}｜櫃檯看板` : "櫃檯看板" };
}

export default async function CounterPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const other = BRANDS.find((b) => b.id !== brand)!;
  const data = await loadCheckin(brand);
  return (
    <CounterBoard
      brand={brand}
      brandName={brandOf(brand).name}
      other={{ id: other.id, name: other.name }}
      per10={data.per10}
      longMin={data.longMin}
    />
  );
}
