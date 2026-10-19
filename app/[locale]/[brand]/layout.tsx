import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BrandNav } from "@/components/BrandNav";
import { routing } from "@/i18n/routing";
import { BRANDS, isBrand } from "@/lib/constants";

// 只開放 /fufu 與 /nukunuku
export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => BRANDS.map((b) => ({ locale, brand: b.id })));
}

/** 品牌區：套用該品牌的色票與字體（data-brand） */
export default async function BrandLayout({ children, params }: { children: ReactNode; params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  return (
    <div data-brand={brand} style={{ background: "var(--ground)", color: "var(--ink)" }}>
      <BrandNav brand={brand} />
      {children}
    </div>
  );
}
