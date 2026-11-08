/**
 * 官網查詢（GROQ）
 * 所有多語欄位用 T()：取目前語言，沒填則退回繁體中文。
 * 每個查詢都需要參數 $lang（zh / en / ja / ko）。
 */

/** 多語欄位：目前語言，沒有則用中文 */
const T = (f: string) => `coalesce(${f}[$lang], ${f}.zh)`;
/** 主要內容是否已翻成目前語言 */
const TR = (f: string) => `($lang == "zh" || defined(${f}[$lang]))`;

const IMG = /* groq */ `{
  ...,
  "alt": coalesce(alt[$lang], alt.zh, ""),
  "caption": coalesce(caption[$lang], caption.zh),
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions{ width, height }
}`;

const RICH = (f: string) => `(${T(f)})[]{
  ...,
  _type == "imageWithAlt" => ${IMG}
}`;

const SEO = /* groq */ `"seo": {
  "title": ${T("seo.title")},
  "description": ${T("seo.description")},
  "image": seo.ogImage,
  "noIndex": seo.noIndex == true
}`;

const STEP = `{ _key, "title": ${T("title")}, "text": ${T("text")}, image${IMG} }`;

export const SHOP = /* groq */ `{
  brand,
  "address": ${T("address")},
  "addressZh": address.zh,
  postalCode, city, location, mapUrl, phone, lineUrl,
  hours[]{ day, closed, open, close },
  "specialDates": specialDates[date >= $today] | order(date asc)[0...6]{ date, closed, open, close, "note": ${T("note")} },
  "prices": prices[]{ _key, "name": ${T("name")}, weekday, holiday, "note": ${T("note")} },
  "priceNote": ${T("priceNote")},
  payments, entryAge, "entryNote": ${T("entryNote")}, noReservation,
  "rules": rules[]{ _key, icon, "text": ${T("text")} },
  "mrt": ${T("mrt")}, "bus": ${T("bus")}, "parking": ${T("parking")},
  mapImage${IMG},
  verifiedAt,
  ${SEO}
}`;

export const CAT_CARD = /* groq */ `{
  _id, brand, status, "slug": slug.current,
  "name": ${T("name")},
  "summary": ${T("summary")},
  gender, birthday,
  cover${IMG}
}`;

const NEWS_CARD = /* groq */ `{
  _id, "slug": slug.current, publishedAt, category, brand, pinned,
  "title": ${T("title")},
  "excerpt": ${T("excerpt")},
  cover${IMG}
}`;

const FAQ_ITEM = /* groq */ `{ _id, category, brand, "question": ${T("question")}, "answer": ${T("answer")} }`;

const GAME_CARD = /* groq */ `{
  _id, "slug": slug.current, url, platforms,
  "title": ${T("title")},
  "summary": ${T("summary")},
  cover${IMG}
}`;

const CAT_SORT = `| order(coalesce(order, 9999) asc, name.zh asc)`;

/* ───────── 全站 ───────── */

export const LAYOUT_QUERY = /* groq */ `{
  "settings": *[_id == "siteSettings"][0]{
    siteName,
    "announcement": announcement{ enabled, until, link, "text": ${T("text")} },
    socials[]{ platform, url },
    "footerLinks": footerLinks[]{ _key, category, url, "name": ${T("name")} },
    "defaultSeo": { "title": ${T("defaultSeo.title")}, "description": ${T("defaultSeo.description")}, "image": defaultSeo.ogImage }
  },
  "shops": *[_type == "shopInfo" && _id in ["shop-fufu", "shop-nukunuku"]]{ brand, "address": ${T("address")}, "addressZh": address.zh, location, lineUrl, phone, mapUrl, hours[]{ day, closed, open, close } }
}`;

export const SEO_DEFAULTS_QUERY = /* groq */ `*[_id == "siteSettings"][0]{
  siteName,
  "title": ${T("defaultSeo.title")},
  "description": ${T("defaultSeo.description")},
  "image": defaultSeo.ogImage
}`;

/* ───────── 首頁 ───────── */

export const HOME_QUERY = /* groq */ `{
  "page": *[_id == "homePage"][0]{
    "heroSlides": heroSlides[hidden != true && defined(image.asset)]{
      _key, link, "heading": ${T("heading")}, "subheading": ${T("subheading")},
      image${IMG}, mobileImage${IMG}
    },
    "headline": ${T("headline")},
    "subheadline": ${T("subheadline")},
    "aboutTitle": ${T("aboutTitle")},
    "aboutSummary": ${T("aboutSummary")},
    "game": playroomGame->${GAME_CARD},
    ${SEO}
  },
  "quest": *[_id == "game-cat-city-quest"][0]${GAME_CARD},
  "brands": *[_type == "brand" && _id in ["brand-fufu", "brand-nukunuku"]]{ brand, "tagline": ${T("tagline")}, "image": coalesce(cardImage, hero)${IMG} },
  "shops": *[_type == "shopInfo" && _id in ["shop-fufu", "shop-nukunuku"]]${SHOP},
  "steps": *[_id == "firstVisitGuide"][0].steps[0...3]${STEP},
  "cats": *[_type == "cat" && featured == true && status != "graduated" && defined(slug.current)] ${CAT_SORT} [0...10]${CAT_CARD},
  "waiting": count(*[_type == "cat" && brand == "nukunuku" && status in ["adoptable", "matching"]]),
  "news": *[_type == "news" && defined(slug.current)] | order(pinned desc, publishedAt desc)[0...3]${NEWS_CARD},
  "faqs": *[_type == "faq" && onHome == true] | order(coalesce(order, 9999) asc)[0...4]${FAQ_ITEM}
}`;

/* ───────── 品牌 ───────── */

export const BRAND_QUERY = /* groq */ `{
  "brand": *[_id == $brandId][0]{
    brand,
    "headline": ${T("headline")},
    "subheadline": ${T("subheadline")},
    "storyTitle": ${T("storyTitle")},
    "story": ${RICH("story")},
    "translated": ${TR("headline")},
    "spend": spend[]${STEP},
    hero${IMG}, storyImage${IMG},
    "space": space[defined(asset)]${IMG},
    ${SEO}
  },
  "shop": *[_id == $shopId][0]${SHOP},
  "cats": *[_type == "cat" && brand == $brand && status != "graduated" && defined(slug.current)] ${CAT_SORT} [0...6]${CAT_CARD},
  "catCount": count(*[_type == "cat" && brand == $brand && status != "graduated"]),
  "waitingCats": *[_type == "cat" && brand == $brand && status in ["adoptable", "matching"] && defined(slug.current)] ${CAT_SORT} [0...6]${CAT_CARD},
  "news": *[_type == "news" && brand in [$brand, "both"] && defined(slug.current)] | order(publishedAt desc)[0...3]${NEWS_CARD},
  "adoption": *[_id == "adoptionGuide"][0]{ since, "steps": steps[]${STEP}, applyUrl },
  "waiting": count(*[_type == "cat" && brand == $brand && status in ["adoptable", "matching"]]),
  "graduated": count(*[_type == "cat" && brand == $brand && status == "graduated"]),
  "stories": *[_type == "graduateStory" && defined(slug.current)] | order(graduatedAt desc)[0...3]{
    _id, "slug": slug.current, graduatedAt,
    "title": ${T("title")}, "catName": ${T("cat->name")},
    "familyWords": ${T("familyWords")},
    "image": coalesce(photos[0], cat->cover)${IMG}
  }
}`;

export const SHOP_QUERY = /* groq */ `*[_id == $shopId][0]${SHOP}`;

export const SHOPS_QUERY = /* groq */ `{
  "page": *[_id == "page-visit"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, cover${IMG}, ${SEO} },
  "shops": *[_type == "shopInfo" && _id in ["shop-fufu", "shop-nukunuku"]]${SHOP}
}`;

/* ───────── 貓咪 ───────── */

export const CATS_QUERY = /* groq */ `{
  "page": *[_id == "page-cats"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, cover${IMG}, ${SEO} },
  "cats": *[_type == "cat" && defined(slug.current)
    && (!defined($brand) || brand == $brand)
    && (!defined($status) || status == $status)
    && (defined($status) || status != "graduated")] ${CAT_SORT} ${CAT_CARD}
}`;

export const CAT_QUERY = /* groq */ `*[_type == "cat" && brand == $brand && slug.current == $slug][0]{
  _id, brand, status, gender, birthday, arrivedAt, neutered, vaccinated, graduatedAt, _updatedAt,
  "slug": slug.current,
  "name": ${T("name")},
  "nameZh": name.zh,
  "summary": ${T("summary")},
  "breed": ${T("breed")},
  "color": ${T("color")},
  "traits": ${T("traits")},
  "story": ${RICH("story")},
  "healthNote": ${T("healthNote")},
  "adoptionNote": ${T("adoptionNote")},
  "translated": ${TR("name")},
  cover${IMG},
  "photos": photos[defined(asset)]${IMG},
  "graduateStory": *[_type == "graduateStory" && cat._ref == ^._id][0]{ "slug": slug.current },
  ${SEO}
}`;

/* ───────── 認養 ───────── */

export const ADOPTION_QUERY = /* groq */ `{
  "guide": *[_id == "adoptionGuide"][0]{
    "title": ${T("title")},
    "intro": ${RICH("intro")},
    since,
    "steps": steps[]${STEP},
    "requirements": ${RICH("requirements")},
    "fees": ${RICH("fees")},
    applyUrl,
    "faqs": faqs[]->${FAQ_ITEM},
    "translated": ${TR("title")},
    ${SEO}
  },
  "cats": *[_type == "cat" && brand == "nukunuku" && status in ["adoptable", "matching"] && defined(slug.current)] ${CAT_SORT} ${CAT_CARD},
  "graduated": count(*[_type == "cat" && brand == "nukunuku" && status == "graduated"])
}`;

export const STORIES_QUERY = /* groq */ `{
  "page": *[_id == "page-graduates"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, cover${IMG}, ${SEO} },
  "stories": *[_type == "graduateStory" && defined(slug.current)] | order(graduatedAt desc){
    _id, "slug": slug.current, graduatedAt,
    "title": ${T("title")}, "catName": ${T("cat->name")},
    "familyWords": ${T("familyWords")},
    "image": coalesce(photos[0], cat->cover)${IMG}
  }
}`;

export const STORY_QUERY = /* groq */ `*[_type == "graduateStory" && slug.current == $slug][0]{
  _id, graduatedAt, _updatedAt, "slug": slug.current,
  "title": ${T("title")},
  "catName": ${T("cat->name")},
  "cat": cat->{ "slug": slug.current, brand },
  "familyWords": ${T("familyWords")},
  "body": ${RICH("body")},
  "photos": photos[defined(asset)]${IMG},
  "image": coalesce(photos[0], cat->cover)${IMG},
  "translated": ${TR("familyWords")},
  ${SEO}
}`;

/* ───────── 消息 ───────── */

export const NEWS_LIST_QUERY = /* groq */ `{
  "page": *[_id == "page-news"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, cover${IMG}, ${SEO} },
  "news": *[_type == "news" && defined(slug.current) && (!defined($category) || category == $category)]
    | order(pinned desc, publishedAt desc)[0...60]${NEWS_CARD}
}`;

export const NEWS_QUERY = /* groq */ `*[_type == "news" && slug.current == $slug][0]{
  _id, publishedAt, _updatedAt, category, brand, eventStart, eventEnd, "slug": slug.current,
  "title": ${T("title")},
  "excerpt": ${T("excerpt")},
  "body": ${RICH("body")},
  "translated": ${TR("title")},
  cover${IMG},
  ${SEO}
}`;

/* ───────── FAQ ───────── */

export const FAQ_QUERY = /* groq */ `{
  "page": *[_id == "page-faq"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, ${SEO} },
  "faqs": *[_type == "faq"] | order(coalesce(order, 9999) asc)${FAQ_ITEM}
}`;

/* ───────── 遊樂室 ───────── */

export const GAMES_QUERY = /* groq */ `{
  "page": *[_id == "page-playroom"][0]{ "title": ${T("title")}, "intro": ${T("intro")}, cover${IMG}, ${SEO} },
  "games": *[_type == "game" && defined(slug.current)] | order(defined(url) desc, coalesce(order, 9999) asc)${GAME_CARD}
}`;

export const GAME_QUERY = /* groq */ `*[_type == "game" && slug.current == $slug][0]{
  _id, url, platforms, _updatedAt, "slug": slug.current,
  "title": ${T("title")},
  "summary": ${T("summary")},
  "howTo": ${RICH("howTo")},
  "translated": ${TR("title")},
  cover${IMG},
  "cats": cats[]->${CAT_CARD},
  ${SEO}
}`;

/* ───────── 內容頁 ───────── */

export const CONTENT_PAGE_QUERY = /* groq */ `*[_id == $id][0]{
  "title": ${T("title")},
  "intro": ${T("intro")},
  "body": ${RICH("body")},
  "translated": ${TR("title")},
  cover${IMG},
  ${SEO}
}`;

export const FIRST_VISIT_QUERY = /* groq */ `{
  "guide": *[_id == "firstVisitGuide"][0]{
    "title": ${T("title")},
    "intro": ${T("intro")},
    "steps": steps[]${STEP},
    "differences": differences[]{ _key, "topic": ${T("topic")}, "fufu": ${T("fufu")}, "nukunuku": ${T("nukunuku")} },
    "notes": ${RICH("notes")},
    "faqs": faqs[]->${FAQ_ITEM},
    "translated": ${TR("title")},
    ${SEO}
  },
  "shops": *[_type == "shopInfo" && _id in ["shop-fufu", "shop-nukunuku"]]{ brand, entryAge, "rules": rules[]{ _key, icon, "text": ${T("text")} } }
}`;

/* ───────── 搜尋引擎 ───────── */

/** 每份內容翻譯了哪些語言（sitemap 用） */
const LANGS = `"langs": ["zh", select(defined(LANGFIELD.en) => "en"), select(defined(LANGFIELD.ja) => "ja"), select(defined(LANGFIELD.ko) => "ko")]`;
const langs = (f: string) => LANGS.replaceAll("LANGFIELD", f);

export const SITEMAP_QUERY = /* groq */ `{
  "cats": *[_type == "cat" && defined(slug.current) && seo.noIndex != true]{ brand, "slug": slug.current, _updatedAt, ${langs("name")} },
  "news": *[_type == "news" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt, ${langs("title")} },
  "games": *[_type == "game" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt, ${langs("title")} },
  "stories": *[_type == "graduateStory" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt, ${langs("familyWords")} }
}`;

export const LLMS_QUERY = /* groq */ `{
  "shops": *[_type == "shopInfo" && _id in ["shop-fufu", "shop-nukunuku"]]${SHOP},
  "brands": *[_type == "brand"]{ brand, "headline": ${T("headline")}, "tagline": ${T("tagline")} },
  "faqs": *[_type == "faq"] | order(coalesce(order, 9999) asc)${FAQ_ITEM},
  "catCount": { "fufu": count(*[_type == "cat" && brand == "fufu" && status != "graduated"]), "nukunuku": count(*[_type == "cat" && brand == "nukunuku" && status != "graduated"]) },
  "waiting": count(*[_type == "cat" && brand == "nukunuku" && status in ["adoptable", "matching"]]),
  "adoptionApply": *[_id == "adoptionGuide"][0].applyUrl
}`;

/* ───────── 靜態路徑 ───────── */

export const CAT_PATHS_QUERY = /* groq */ `*[_type == "cat" && defined(slug.current)]{ brand, "slug": slug.current }`;
export const NEWS_SLUGS_QUERY = /* groq */ `*[_type == "news" && defined(slug.current)].slug.current`;
export const GAME_SLUGS_QUERY = /* groq */ `*[_type == "game" && defined(slug.current)].slug.current`;
export const STORY_SLUGS_QUERY = /* groq */ `*[_type == "graduateStory" && defined(slug.current)].slug.current`;
