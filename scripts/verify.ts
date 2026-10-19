/**
 * 驗收腳本：用真實的 Sanity 專案實測，不使用模擬資料。
 *
 *   npm run verify            執行全部檢查，結束後清除測試資料
 *   npm run verify -- --keep  保留測試資料（可到後台查看）
 *
 * 檢查項目：
 *   1. 管理員 token 可上傳照片，且系統讀到正確尺寸
 *   2. 可儲存為草稿
 *   3. 【安全】訪客（無 token）讀不到草稿，即使直接指定草稿 ID
 *   4. 【安全】訪客無法新增、修改資料
 *   5. 發布後，訪客可讀到內容與照片
 *   6. 圖片 CDN 可自動產生指定寬度、自動轉 WebP
 *   7. 正式內容：主視覺、品牌頁、來店資訊是否已核對、認養狀態只在 NUKUNUKU、翻譯進度、遊戲連結
 *   8. 官網：首頁顯示主視覺、四種語言各頁可開啟、不存在的網址回 404、sitemap/hreflang/結構化資料
 *   （需先 npm run dev 或已部署）
 */
import { createClient } from "@sanity/client";
import { deflateSync } from "node:zlib";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-07-01";
const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const siteUrl = process.env.VERIFY_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const keep = process.argv.includes("--keep");

const TEST_ID = "verify-phase1";
const DRAFT_ID = `drafts.${TEST_ID}`;

let failed = 0;
const pass = (m: string) => console.log(`  ✓ ${m}`);
const fail = (m: string) => { failed++; console.log(`  ✗ ${m}`); };
const info = (m: string) => console.log(`  · ${m}`);
const step = (m: string) => console.log(`\n${m}`);

/** 產生一張 1600×900 的漸層 PNG（不依賴任何圖片套件） */
function makeTestPng(w = 1600, h = 900): Buffer {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const o = row + 1 + x * 3;
      raw[o] = 230 - Math.round((x / w) * 90);
      raw[o + 1] = 160 + Math.round((y / h) * 40);
      raw[o + 2] = 110 + Math.round((x / w) * 90);
    }
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b: Buffer) => {
    let c = 0xffffffff;
    for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

async function main() {
  console.log(`FUFU × NUKUNUKU 官網驗收｜專案 ${projectId} / ${dataset}`);
  if (!projectId || !dataset) throw new Error("缺少 NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET");
  if (!writeToken) throw new Error("缺少 SANITY_API_WRITE_TOKEN（Editor 權限）");

  const admin = createClient({ projectId, dataset, apiVersion, token: writeToken, useCdn: false });
  const visitor = createClient({ projectId, dataset, apiVersion, useCdn: false }); // 不帶 token = 一般訪客

  // 1. 上傳
  step("1. 上傳照片");
  const png = makeTestPng();
  const asset = await admin.assets.upload("image", png, { filename: "verify-phase1.png", contentType: "image/png" });
  const dims = (asset.metadata as { dimensions?: { width: number; height: number } })?.dimensions;
  dims?.width === 1600 && dims?.height === 900
    ? pass(`上傳成功，系統讀到尺寸 1600×900（${asset._id}）`)
    : fail(`尺寸不符：${JSON.stringify(dims)}`);

  // 2. 草稿
  step("2. 儲存為草稿");
  const doc = {
    _type: "verifyTest",
    title: "驗收測試",
    image: { _type: "imageWithAlt", asset: { _type: "reference", _ref: asset._id }, alt: "驗收用測試圖片" },
  };
  await admin.createOrReplace({ _id: DRAFT_ID, ...doc });
  (await admin.getDocument(DRAFT_ID)) ? pass("草稿已儲存") : fail("讀不到剛存的草稿");

  // 3. 訪客讀不到草稿
  step("3.【安全】訪客讀取草稿");
  const leaked = await visitor.fetch(`*[_id == $id]`, { id: DRAFT_ID }, { perspective: "raw" });
  leaked.length === 0 ? pass("訪客直接查詢草稿 ID → 查無資料") : fail("訪客可以讀到草稿！請檢查資料集權限");
  const beforePublish = await visitor.fetch(`*[_id == $id][0]`, { id: TEST_ID });
  !beforePublish ? pass("發布前，訪客看不到這份內容") : fail("尚未發布就被訪客看到");

  // 4. 訪客無法寫入
  step("4.【安全】訪客嘗試寫入");
  try {
    await visitor.create({ _type: "verifyTest", title: "未授權寫入" });
    fail("訪客成功寫入資料！請立即檢查專案設定");
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    code === 401 || code === 403 ? pass(`被拒絕（HTTP ${code}）`) : fail(`預期 401/403，實際：${(e as Error).message}`);
  }
  try {
    await visitor.patch(DRAFT_ID).set({ title: "竄改" }).commit();
    fail("訪客成功修改草稿！");
  } catch (e) {
    pass(`修改被拒絕（HTTP ${(e as { statusCode?: number }).statusCode ?? "?"}）`);
  }

  // 5. 發布
  step("5. 發布");
  await admin.transaction().createOrReplace({ _id: TEST_ID, ...doc }).delete(DRAFT_ID).commit();
  const published = await visitor.fetch(
    `*[_id == $id][0]{ title, "url": image.asset->url, "alt": image.alt }`,
    { id: TEST_ID },
  );
  published?.url ? pass(`訪客可讀到已發布內容，ALT =「${published.alt}」`) : fail("發布後訪客讀不到（資料集是否設為 Private？）");

  // 6. 自動產生顯示尺寸
  step("6. 圖片自動縮放與格式轉換");
  if (published?.url) {
    const r1 = await fetch(`${published.url}?w=400&fm=png`);
    const b1 = Buffer.from(await r1.arrayBuffer());
    const w = b1.readUInt32BE(16), h = b1.readUInt32BE(20);
    r1.ok && w === 400 && h === 225 ? pass(`?w=400 → 實際輸出 ${w}×${h}`) : fail(`縮圖異常：HTTP ${r1.status}, ${w}×${h}`);

    const r2 = await fetch(`${published.url}?w=1200&auto=format`, { headers: { Accept: "image/avif,image/webp,*/*" } });
    const type = r2.headers.get("content-type");
    r2.ok && /webp|avif/.test(type ?? "") ? pass(`自動轉檔 → ${type}`) : fail(`未自動轉成 WebP/AVIF：${type}`);
  }

  // 7. 正式內容狀態
  step("7. 正式內容發布狀態（只讀取，不修改）");
  const status = await visitor.fetch(`{
    "home": *[_id == "homePage"][0]{ "slides": heroSlides[hidden != true && defined(image.asset)]{ "ref": image.asset._ref, "alt": image.alt.zh } },
    "brands": *[_id in ["brand-fufu", "brand-nukunuku"]].brand,
    "shops": *[_id in ["shop-fufu", "shop-nukunuku"]]{ brand, verified, verifiedAt },
    "cats": { "fufu": count(*[_type == "cat" && brand == "fufu"]), "nukunuku": count(*[_type == "cat" && brand == "nukunuku"]) },
    "badStatus": count(*[_type == "cat" && brand == "fufu" && status in ["adoptable", "matching", "graduated"]]),
    "langs": {
      "en": count(*[_type in ["cat", "news"] && defined(coalesce(name.en, title.en))]),
      "ja": count(*[_type in ["cat", "news"] && defined(coalesce(name.ja, title.ja))]),
      "ko": count(*[_type in ["cat", "news"] && defined(coalesce(name.ko, title.ko))]),
      "all": count(*[_type in ["cat", "news"]])
    },
    "games": { "total": count(*[_type == "game"]), "live": count(*[_type == "game" && defined(url)]) },
    "news": count(*[_type == "news"]),
    "faqs": count(*[_type == "faq"])
  }`);
  const slides: { ref: string; alt?: string }[] = status.home?.slides ?? [];
  slides.length ? pass(`首頁已發布 ${slides.length} 張主視覺`) : info("首頁尚未發布主視覺（請到後台上傳並發布後再跑一次）");
  if (slides.some((x) => !x.alt)) info("有主視覺未填中文 ALT（若為純裝飾圖片可忽略）");
  for (const b of ["fufu", "nukunuku"]) {
    status.brands.includes(b) ? pass(`${b.toUpperCase()} 品牌頁已發布`) : info(`${b.toUpperCase()} 品牌頁尚未發布`);
    const shop = status.shops.find((x: { brand: string }) => x.brand === b);
    if (!shop) info(`${b.toUpperCase()} 來店資訊尚未發布（官網會顯示「營業資訊確認中」）`);
    else shop.verified && shop.verifiedAt ? pass(`${b.toUpperCase()} 來店資訊已核對（${shop.verifiedAt.slice(0, 10)}）`) : fail(`${b.toUpperCase()} 來店資訊已發布但缺少核對紀錄`);
  }
  status.badStatus === 0 ? pass("FUFU 沒有被標成認養狀態的貓（認養只在 NUKUNUKU）") : fail(`FUFU 有 ${status.badStatus} 隻貓標成認養相關狀態`);
  info(`貓咪：FUFU ${status.cats.fufu} 隻、NUKUNUKU ${status.cats.nukunuku} 隻；消息 ${status.news} 則；常見問題 ${status.faqs} 題`);
  info(`遊戲 ${status.games.total} 個（已上線 ${status.games.live}，其餘顯示「即將推出」）`);
  const L = status.langs;
  if (L.all) info(`貓咪與消息翻譯：English ${L.en}/${L.all}、日本語 ${L.ja}/${L.all}、한국어 ${L.ko}/${L.all}`);

  // 8. 官網實際顯示
  step(`8. 官網顯示（${siteUrl}）`);
  try {
    const html = await (await fetch(siteUrl, { cache: "no-store" })).text();
    if (!slides.length) info("首頁尚無主視覺，略過比對");
    else {
      const hash = slides[0].ref.split("-")[1];
      html.includes(hash) ? pass("官網首頁已顯示第一張主視覺") : fail("官網首頁找不到第一張主視覺（剛發布可等幾秒再試）");
    }
    const ok = [
      "/", "/fufu", "/nukunuku", "/fufu/cats", "/nukunuku/cats", "/fufu/visit", "/nukunuku/visit", "/visit", "/first-visit",
      "/nukunuku/adoption", "/nukunuku/graduates", "/cats", "/news", "/faq", "/playroom", "/about", "/privacy",
      "/en", "/ja", "/ko", "/en/fufu", "/ja/visit", "/ko/nukunuku/adoption",
      "/sitemap.xml", "/robots.txt", "/llms.txt",
    ];
    let okCount = 0;
    for (const path of ok) {
      const r = await fetch(new URL(path, siteUrl), { cache: "no-store" });
      r.ok ? okCount++ : fail(`${path} 回應 HTTP ${r.status}`);
    }
    if (okCount === ok.length) pass(`${ok.length} 個頁面（含四種語言、sitemap、llms.txt）全部正常`);
    for (const path of ["/fufu/cats/__not-a-real-cat__", "/fufu/adoption", "/abc", "/en/abc"]) {
      const r = await fetch(new URL(path, siteUrl), { cache: "no-store" });
      r.status === 404 ? pass(`${path} → 404`) : fail(`${path} 應回 404，實際 ${r.status}`);
    }
    const sm = await (await fetch(new URL("/sitemap.xml", siteUrl), { cache: "no-store" })).text();
    ["hreflang=\"en\"", "hreflang=\"ja\"", "hreflang=\"ko\"", "hreflang=\"zh-Hant-TW\""].every((h) => sm.includes(h))
      ? pass("sitemap 含四語 hreflang")
      : fail("sitemap 缺少部分語言的 hreflang");
    const zhHome = await (await fetch(new URL("/", siteUrl), { cache: "no-store" })).text();
    zhHome.includes('hrefLang="ko"') || zhHome.includes('hreflang="ko"') ? pass("頁面含 hreflang 語言對應") : fail("頁面缺少 hreflang");
    zhHome.includes("application/ld+json") ? pass("頁面含結構化資料（JSON-LD）") : fail("頁面缺少結構化資料");
  } catch {
    info("連不到官網，略過。請先在另一個終端機執行 npm run dev，或設定 VERIFY_SITE_URL 為正式網址");
  }

  // 清除
  if (!keep) {
    await admin.delete(TEST_ID).catch(() => {});
    await admin.delete(asset._id).catch(() => {});
    console.log("\n已清除測試資料。");
  }

  console.log(failed ? `\n結果：${failed} 項未通過 ✗` : "\n結果：全部通過 ✓");
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error("\n✗ 執行失敗：", e.message);
  process.exit(1);
});
