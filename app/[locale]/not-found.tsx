import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="wrap not-found">
      <p className="code">404</p>
      <h1>{t("notFoundTitle")}</h1>
      <p className="muted" style={{ margin: "8px 0 28px" }}>{t("notFoundText")}</p>
      <Link href="/" className="btn">{t("backHome")}</Link>
    </div>
  );
}
