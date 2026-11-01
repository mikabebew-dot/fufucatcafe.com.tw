import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DAYS } from "@/lib/constants";
import { directionsUrl, lineUrl, telUrl } from "@/lib/contact";
import { groupHours } from "@/lib/hours";
import type { Shop } from "@/lib/types";
import { OpenStatus } from "./OpenStatus";
import { SanityImage } from "./SanityImage";

const nt = (n?: number | null) => (typeof n === "number" ? `NT$${n.toLocaleString("en-US")}` : "—");

/** 「週一–週五 11:00–20:00」 */
function useHoursText() {
  const t = useTranslations();
  return (shop: Shop) =>
    groupHours(shop.hours).map((g) => {
      const first = t(`days.${g.days[0]}` as "days.mon");
      const last = t(`days.${g.days.at(-1)!}` as "days.mon");
      const label = g.days.length > 1 ? `${first}–${last}` : first;
      return { label, value: g.closed ? t("visit.closed") : `${g.open}–${g.close}` };
    });
}

function priceSummary(shop: Shop) {
  const p = shop.prices?.[0];
  if (!p) return null;
  return `${p.name}  ${nt(p.weekday)}${p.holiday != null && p.holiday !== p.weekday ? ` / ${nt(p.holiday)}` : ""}`;
}

/** 營業資訊卡：兩品牌結構一致、只換識別 */
export function InfoCard({ shop, brand, headingLevel = 2 }: { shop: Shop | null; brand: string; headingLevel?: 2 | 3 }) {
  const t = useTranslations("visit");
  const hoursText = useHoursText();
  const H = headingLevel === 2 ? "h2" : "h3";
  if (!shop) return <p className="notice">{t("notReady")}</p>;
  const hours = hoursText(shop);
  return (
    <section className="panel info-card" aria-labelledby={`info-${brand}`}>
      <div className="head">
        <H id={`info-${brand}`}>{t("info")}</H>
        <OpenStatus hours={shop.hours} special={shop.specialDates} />
      </div>
      <dl className="info-dl">
        {priceSummary(shop) && (
          <>
            <dt>{t("price")}</dt>
            <dd className="tabular">{priceSummary(shop)}</dd>
          </>
        )}
        {hours.length > 0 && (
          <>
            <dt>{t("hours")}</dt>
            <dd className="tabular">{hours.map((h) => <div key={h.label}>{h.label}　{h.value}</div>)}</dd>
          </>
        )}
        {shop.address && (
          <>
            <dt>{t("address")}</dt>
            <dd>{shop.address}</dd>
          </>
        )}
        <dt>{t("entry")}</dt>
        <dd>
          {shop.entryAge ? t("entryAge", { age: shop.entryAge }) : t("entryAll")}
          {shop.noReservation !== false && `・${t("noReservation")}`}
        </dd>
      </dl>
      <ContactButtons shop={shop} brand={brand} />
      <div className="btn-row">
        <span />
        <Link className="btn btn-ghost" href={`/${brand}/visit`}>{t("details")}</Link>
      </div>
    </section>
  );
}

export function PriceTable({ shop }: { shop: Shop }) {
  const t = useTranslations("visit");
  const tc = useTranslations("common");
  const format = useFormatter();
  if (!shop.prices?.length) return null;
  return (
    <div className="table-box">
      <table className="price-table">
        <thead>
          <tr>
            <th scope="col">{t("plan")}</th>
            <th scope="col" className="num">{t("weekday")}</th>
            <th scope="col" className="num">{t("holiday")}</th>
          </tr>
        </thead>
        <tbody>
          {shop.prices.map((p) => (
            <tr key={p._key}>
              <td>
                {p.name}
                {p.note && <small>{p.note}</small>}
              </td>
              <td className="num">{nt(p.weekday)}</td>
              <td className="num">{nt(p.holiday)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="table-foot">
        {shop.priceNote && <span style={{ display: "block", whiteSpace: "pre-line" }}>{shop.priceNote}</span>}
        {shop.verifiedAt && tc("verifiedOn", { date: format.dateTime(new Date(shop.verifiedAt), { year: "numeric", month: "2-digit", day: "2-digit" }) })}
      </p>
    </div>
  );
}

const RULE_PATHS: Record<string, string> = {
  wash: "M6 10c0-3 1.5-5 4-5s4 2 4 5M5 11h10l-1 5H6z",
  noHold: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM5 15L15 5",
  noChase: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM5 15L15 5",
  noFlash: "M3 6h14v10H3zM10 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 3l14 14",
  noFood: "M6 3v6a2 2 0 0 0 4 0V3M8 9v8M14 3c-1.5 1-2 3-2 5h2v9M3 3l14 14",
  quiet: "M4 8h3l4-3v10l-4-3H4zM14 8l3 4M17 8l-3 4",
  child: "M10 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 17v-5l4-2 4 2v5",
  time: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v4l3 2",
};

export function RulesList({ rules }: { rules?: Shop["rules"] }) {
  if (!rules?.length) return null;
  return (
    <ul className="rules">
      {rules.map((r) => (
        <li key={r._key}>
          <span className="ico" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={RULE_PATHS[r.icon ?? "time"] ?? RULE_PATHS.time} />
            </svg>
          </span>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** 來店資訊完整版：/[brand]/visit 與 /visit 使用 */
export function VisitFull({ shop, headingLevel = 2 }: { shop: Shop; headingLevel?: 2 | 3 }) {
  const t = useTranslations();
  const format = useFormatter();
  const hoursText = useHoursText();
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="stack" style={{ ["--gap" as string]: "36px" }}>
      <section className="stack">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <H>{t("visit.hours")}</H>
          <OpenStatus hours={shop.hours} special={shop.specialDates} />
        </div>
        <ul className="hours-list">
          {hoursText(shop).map((h) => (
            <li key={h.label}><span>{h.label}</span><span>{h.value}</span></li>
          ))}
        </ul>
        {!!shop.specialDates?.length && (
          <div>
            <p className="small muted" style={{ marginBottom: 6 }}>{t("visit.specialDates")}</p>
            <ul className="hours-list">
              {shop.specialDates.map((s) => (
                <li key={s.date}>
                  <span>{format.dateTime(new Date(`${s.date}T00:00:00+08:00`), { month: "short", day: "numeric", weekday: "short" })}{s.note ? `・${s.note}` : ""}</span>
                  <span>{s.closed ? t("visit.closed") : `${s.open}–${s.close}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="stack">
        <H>{t("visit.price")}</H>
        <PriceTable shop={shop} />
        {!!shop.payments?.length && (
          <div>
            <p className="small muted" style={{ marginBottom: 6 }}>{t("visit.payment")}</p>
            <ul className="pay-list">
              {shop.payments.map((p) => <li key={p}>{t(`payments.${p}` as "payments.cash")}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section className="stack">
        <H>{t("visit.rules")}</H>
        <p>
          {shop.entryAge ? t("visit.entryAge", { age: shop.entryAge }) : t("visit.entryAll")}
          {shop.noReservation !== false && `・${t("visit.noReservation")}`}
          {shop.entryNote && <span className="muted">（{shop.entryNote}）</span>}
        </p>
        <RulesList rules={shop.rules} />
      </section>

      <section className="stack">
        <H>{t("visit.access")}</H>
        {shop.mapImage?.asset ? (
          shop.mapUrl ? (
            <a className="map-img" href={shop.mapUrl} target="_blank" rel="noopener noreferrer">
              <SanityImage image={shop.mapImage} fill sizes="(max-width: 899px) 100vw, 50vw" />
            </a>
          ) : (
            <div className="map-img"><SanityImage image={shop.mapImage} fill sizes="(max-width: 899px) 100vw, 50vw" /></div>
          )
        ) : null}
        <dl className="access-list">
          {shop.address && (<div><dt>{t("visit.address")}</dt><dd>{shop.address}</dd></div>)}
          {shop.mrt && (<div><dt>{t("visit.mrt")}</dt><dd>{shop.mrt}</dd></div>)}
          {shop.bus && (<div><dt>{t("visit.bus")}</dt><dd>{shop.bus}</dd></div>)}
          {shop.parking && (<div><dt>{t("visit.parking")}</dt><dd>{shop.parking}</dd></div>)}
          {shop.phone && (<div><dt>{t("visit.phone")}</dt><dd className="tabular">{shop.phone}</dd></div>)}
        </dl>
        <ContactButtons shop={shop} brand={shop.brand} />
      </section>
    </div>
  );
}

/** 導航、LINE、電話三個大按鈕（手機一鍵開啟地圖 App／LINE／撥號） */
export function ContactButtons({ shop, brand }: { shop: Shop; brand: string }) {
  const tc = useTranslations("common");
  const nav = directionsUrl(shop);
  const line = lineUrl(shop, brand);
  const tel = telUrl(shop.phone);
  if (!nav && !line && !tel) return null;
  return (
    <div className="contact-row">
      {nav && <a className="btn contact-btn" href={nav} target="_blank" rel="noopener noreferrer">📍 {tc("directions")}</a>}
      {line && <a className="btn contact-btn contact-line" href={line} target="_blank" rel="noopener noreferrer">💬 {tc("line")}</a>}
      {tel && <a className="btn btn-ghost contact-btn" href={tel}>📞 {tc("call")}</a>}
    </div>
  );
}
