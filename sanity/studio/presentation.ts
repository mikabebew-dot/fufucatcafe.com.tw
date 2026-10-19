import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";

/** 讓「預覽」工具知道每份內容對應官網哪一頁（繁中版網址） */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/", filter: `_id == "homePage"` },
    { route: "/about", filter: `_id == "page-about"` },
    { route: "/privacy", filter: `_id == "page-privacy"` },
    { route: "/first-visit", filter: `_id == "firstVisitGuide"` },
    { route: "/visit", filter: `_id == "page-visit"` },
    { route: "/cats", filter: `_id == "page-cats"` },
    { route: "/news", filter: `_id == "page-news"` },
    { route: "/faq", filter: `_id == "page-faq"` },
    { route: "/playroom", filter: `_id == "page-playroom"` },
    { route: "/nukunuku/adoption", filter: `_id == "adoptionGuide"` },
    { route: "/nukunuku/graduates", filter: `_id == "page-graduates"` },
    { route: "/news/:slug", filter: `_type == "news" && slug.current == $slug` },
    { route: "/playroom/:slug", filter: `_type == "game" && slug.current == $slug` },
    { route: "/nukunuku/graduates/:slug", filter: `_type == "graduateStory" && slug.current == $slug` },
    { route: "/:brand/cats/:slug", filter: `_type == "cat" && slug.current == $slug` },
    { route: "/:brand/visit", resolve: (ctx) => ({ filter: `_id == $id`, params: { id: `shop-${ctx.params.brand}` } }) },
    { route: "/:brand", resolve: (ctx) => ({ filter: `_id == $id`, params: { id: `brand-${ctx.params.brand}` } }) },
  ]),
  locations: {
    brand: defineLocations({
      select: { brand: "brand" },
      resolve: (d) => ({ locations: d?.brand ? [{ title: "品牌頁", href: `/${d.brand}` }, { title: "首頁", href: "/" }] : [] }),
    }),
    shopInfo: defineLocations({
      select: { brand: "brand" },
      resolve: (d) => ({
        locations: d?.brand
          ? [{ title: "來店資訊", href: `/${d.brand}/visit` }, { title: "兩店比較", href: "/visit" }, { title: "首頁", href: "/" }]
          : [],
      }),
    }),
    cat: defineLocations({
      select: { name: "name.zh", slug: "slug.current", brand: "brand" },
      resolve: (d) => ({
        locations:
          d?.slug && d?.brand
            ? [{ title: d.name || "貓咪", href: `/${d.brand}/cats/${d.slug}` }, { title: "貓咪列表", href: `/${d.brand}/cats` }]
            : [],
      }),
    }),
    news: defineLocations({
      select: { title: "title.zh", slug: "slug.current" },
      resolve: (d) => ({ locations: d?.slug ? [{ title: d.title || "消息", href: `/news/${d.slug}` }, { title: "最新消息", href: "/news" }] : [] }),
    }),
    game: defineLocations({
      select: { title: "title.zh", slug: "slug.current" },
      resolve: (d) => ({ locations: d?.slug ? [{ title: d.title || "遊戲", href: `/playroom/${d.slug}` }, { title: "遊樂室", href: "/playroom" }] : [] }),
    }),
    graduateStory: defineLocations({
      select: { slug: "slug.current" },
      resolve: (d) => ({ locations: d?.slug ? [{ title: "畢業故事", href: `/nukunuku/graduates/${d.slug}` }] : [] }),
    }),
    faq: defineLocations({ locations: [{ title: "常見問題", href: "/faq" }] }),
  },
};
