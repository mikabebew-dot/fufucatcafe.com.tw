import { notFound } from "next/navigation";
import { BRANDS, brandOf, isBrand } from "@/lib/constants";
import { CounterBoard } from "./CounterBoard";

export function generateStaticParams() {
  return BRANDS.map((b) => ({ brand: b.id }));
}

export default async function CounterPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const other = BRANDS.find((b) => b.id !== brand)!;
  return <CounterBoard brand={brand} brandName={brandOf(brand).name} other={{ id: other.id, name: other.name }} />;
}
