import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BRANDS } from "@/lib/constants";
import { directionsUrl, lineUrl } from "@/lib/contact";
import { LangSwitcher } from "./LangSwitcher";

type FooterData = {
  siteName: string;
  shops: { brand: string; address?: string; addressZh?: string; location?: { lat: number; lng: number } | null; lineUrl?: string; phone?: string; mapUrl?: string }[];
  socials: { platform: string; url: string }[];
  footerLinks: { _key: string; category: "store" | "partner"; url: string; name: string }[];
};

export async function SiteFooter({ data }: { data: FooterData }) {
  const t = await getTranslations();
  const stores = data.footerLinks.filter((l) => l.category === "store");
  const partners = data.footerLinks.filter((l) => l.category === "partner");
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          {BRANDS.map((b) => {
            const shop = data.shops.find((s) => s.brand === b.id);
            return (
              <div key={b.id} className={`footer-shop ${b.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt={b.official} width={48} height={48} />
                <div>
                  <Link href={`/${b.id}`} style={{ fontWeight: 500, textDecoration: "none" }}>{b.official}</Link>
                  {shop?.address && <p>{shop.address}</p>}
                  {shop?.phone && <p className="tabular">{shop.phone}</p>}
                  <p style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    {directionsUrl(shop) && <a href={directionsUrl(shop)} target="_blank" rel="noopener noreferrer">{t("common.directions")} ↗</a>}
                    {lineUrl(shop, b.id) && <a href={lineUrl(shop, b.id)} target="_blank" rel="noopener noreferrer">LINE ↗</a>}
                    <Link href={`/${b.id}/visit`}>{t("visit.details")}</Link>
                  </p>
                  <p style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
                    {b.socials.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.platform} ↗</a>)}
                  </p>
                </div>
              </div>
            );
          })}

          <nav aria-label={t("nav.footerNav")}>
            <ul className="footer-links" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <li><Link href="/about">{t("nav.about")}</Link></li>
              <li><Link href="/first-visit">{t("nav.firstVisit")}</Link></li>
              <li><Link href="/visit">{t("nav.visit")}</Link></li>
              <li><Link href="/cats">{t("nav.cats")}</Link></li>
              <li><Link href="/nukunuku/adoption">{t("nav.adoption")}</Link></li>
              <li><Link href="/nukunuku/graduates">{t("nav.graduates")}</Link></li>
              <li><Link href="/news">{t("nav.news")}</Link></li>
              <li><Link href="/faq">{t("nav.faq")}</Link></li>
              <li><Link href="/playroom">{t("nav.playroom")}</Link></li>
            </ul>
          </nav>

          <div className="stack" style={{ ["--gap" as string]: "20px" }}>
            {stores.length > 0 && (
              <div>
                <p className="footer-title">{t("footer.onlineStore")}</p>
                <ul className="footer-links">
                  {stores.map((l) => <li key={l._key}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.name} ↗</a></li>)}
                </ul>
              </div>
            )}
            {partners.length > 0 && (
              <div>
                <p className="footer-title">{t("footer.partners")}</p>
                <ul className="footer-links">
                  {partners.map((l) => <li key={l._key}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.name} ↗</a></li>)}
                </ul>
              </div>
            )}
            {data.socials.length > 0 && (
              <div>
                <p className="footer-title">{t("footer.follow")}</p>
                <ul className="footer-links">
                  {data.socials.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.platform} ↗</a></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <LangSwitcher />
          <span>
            <Link href="/privacy">{t("nav.privacy")}</Link>　© {new Date().getFullYear()} {data.siteName}
          </span>
        </div>
      </div>
    </footer>
  );
}
