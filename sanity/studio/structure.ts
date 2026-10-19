import { CogIcon, DocumentIcon, DocumentTextIcon, HeartIcon, HelpCircleIcon, HomeIcon, PinIcon, PlayIcon, TagIcon, ThListIcon, UsersIcon } from "@sanity/icons";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { ADOPTION_BRAND, BRANDS, CAT_STATUS, LISTING_PAGES, SINGLETON, brandDocId, shopDocId, type BrandId } from "@/lib/constants";

const single = (S: StructureBuilder, type: string, id: string, title: string, icon = DocumentIcon, template?: string) => {
  let doc = S.document().id(`${id}-doc`).schemaType(type).documentId(id).title(title);
  if (template) doc = doc.initialValueTemplate(template);
  return S.listItem().title(title).id(id).icon(icon).child(doc);
};

const catList = (S: StructureBuilder, brand: BrandId, title: string, status?: string) =>
  S.documentList()
    .id(`${brand}-cats-${status ?? "all"}-list`)
    .title(title)
    .schemaType("cat")
    .filter(`_type == "cat" && brand == $brand${status ? " && status == $status" : ""}`)
    .params(status ? { brand, status } : { brand })
    .initialValueTemplates([S.initialValueTemplateItem(`cat-${brand}`)])
    .defaultOrdering([{ field: "order", direction: "asc" }]);

const brandFolder = (S: StructureBuilder, brand: BrandId) => {
  const b = BRANDS.find((x) => x.id === brand)!;
  const statuses = CAT_STATUS.filter((s) => (s.brands as readonly string[]).includes(brand));
  const items = [
    single(S, "brand", brandDocId(brand), "品牌頁", TagIcon, `brand-${brand}`),
    single(S, "shopInfo", shopDocId(brand), "來店資訊（價格・時間・交通）", PinIcon, `shop-${brand}`),
    S.listItem()
      .title("貓咪")
      .id(`${brand}-cats`)
      .icon(UsersIcon)
      .child(
        S.list()
          .id(`${brand}-cats-list`)
          .title(`${b.name} 的貓咪`)
          .items([
            S.listItem().title("全部").id(`${brand}-cats-all`).child(catList(S, brand, `${b.name} 全部貓咪`)),
            ...statuses.map((s) => S.listItem().title(s.title).id(`${brand}-cats-${s.value}`).child(catList(S, brand, s.title, s.value))),
          ]),
      ),
  ];
  if (brand === ADOPTION_BRAND) {
    items.push(
      single(S, "adoptionGuide", SINGLETON.adoption, "認養說明", HeartIcon),
      S.documentTypeListItem("graduateStory").id("graduateStory").title("畢業故事").icon(HeartIcon),
    );
  }
  return S.listItem().title(b.name).id(brand).icon(TagIcon).child(S.list().id(`${brand}-list`).title(b.name).items(items));
};

const listing = (S: StructureBuilder, id: string) => {
  const p = LISTING_PAGES.find((x) => x.id === id)!;
  return single(S, "listingPage", p.id, `「${p.title}」頁面設定`, ThListIcon, p.id);
};

/** 後台左側選單 */
export const structure: StructureResolver = (S) =>
  S.list()
    .id("root")
    .title("內容管理")
    .items([
      single(S, "homePage", SINGLETON.home, "首頁", HomeIcon),
      S.divider(),
      brandFolder(S, "fufu"),
      brandFolder(S, "nukunuku"),
      S.divider(),
      S.listItem()
        .title("來店相關頁面")
        .id("visit-pages")
        .icon(PinIcon)
        .child(
          S.list()
            .id("visit-pages-list")
            .title("來店相關頁面")
            .items([
              single(S, "firstVisitGuide", SINGLETON.firstVisit, "第一次來店指南"),
              listing(S, "page-visit"),
              single(S, "contentPage", SINGLETON.about, "品牌理念", DocumentIcon, SINGLETON.about),
            ]),
        ),
      S.listItem()
        .title("最新消息")
        .id("news")
        .icon(DocumentTextIcon)
        .child(S.list().id("news-list").title("最新消息").items([S.documentTypeListItem("news").title("全部消息"), listing(S, "page-news")])),
      S.listItem()
        .title("常見問題")
        .id("faq")
        .icon(HelpCircleIcon)
        .child(S.list().id("faq-list").title("常見問題").items([S.documentTypeListItem("faq").title("全部問題"), listing(S, "page-faq")])),
      S.listItem()
        .title("貓咪遊樂室")
        .id("playroom")
        .icon(PlayIcon)
        .child(S.list().id("playroom-list").title("貓咪遊樂室").items([S.documentTypeListItem("game").title("遊戲"), listing(S, "page-playroom")])),
      S.divider(),
      S.listItem()
        .title("其他列表頁設定")
        .id("listing-others")
        .icon(ThListIcon)
        .child(S.list().id("listing-others-list").title("其他列表頁設定").items([listing(S, "page-cats"), listing(S, "page-graduates")])),
      single(S, "contentPage", SINGLETON.privacy, "隱私權政策", DocumentIcon, SINGLETON.privacy),
      single(S, "siteSettings", SINGLETON.settings, "網站設定（公告列・頁尾連結・社群）", CogIcon),
    ]);
