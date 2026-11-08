import { notFound } from "next/navigation";
import { brandOf, isBrand } from "@/lib/constants";
import { loadCheckin } from "@/lib/checkin/data";
import { CheckinFlow } from "./CheckinFlow";

// 後台改了貓咪或價格，最多 60 秒後入場頁就會更新
export const revalidate = 60;

export function generateStaticParams() {
  return [{ brand: "fufu" }, { brand: "nukunuku" }];
}

export default async function CheckinPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const data = await loadCheckin(brand);
  const b = brandOf(brand);
  return <CheckinFlow data={data} brandName={b.name} logo={b.logo} />;
}
