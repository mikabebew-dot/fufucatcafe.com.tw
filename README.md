# FUFU × NUKUNUKU 官方網站

Next.js（官網）＋ Sanity（後台）。依「FUFU × NUKUNUKU 官網規劃」畫布實作，手機優先。

- 官網：繁體中文在根目錄，英文 `/en`、日文 `/ja`、韓文 `/ko`
- 後台：`/studio`，電腦與手機瀏覽器都能操作

> **狀態**：程式已完成，但尚未在真實環境執行過（開發環境無法連到 npm 與 Sanity）。
> 請依「三、第一次設定」與「四、驗收」操作；任何錯誤訊息貼回即可修正。

---

## 一、網站內容

| 網址 | 內容 | 後台位置 |
|---|---|---|
| `/` | 主視覺、今日營業（價格・交通）、兩個品牌入口、理念、第一次來店、精選貓咪、認養、消息、遊樂室小卡、常見問題 | 首頁 |
| `/fufu`、`/nukunuku` | 品牌頁（各自的識別）：理念、來店資訊卡、貓咪、空間、價格與約定、消息 | FUFU／NUKUNUKU → 品牌頁 |
| `/fufu/cats`、`/nukunuku/cats` | 各店貓咪，可依狀態篩選 | FUFU／NUKUNUKU → 貓咪 |
| `/fufu/cats/名字` | 貓咪個人頁；NUKUNUKU 另有到店日期、健康、認養條件 | 同上 |
| `/fufu/visit`、`/nukunuku/visit` | 營業時間、特別營業日、價格表、付款、入場規則、交通 | FUFU／NUKUNUKU → 來店資訊 |
| `/visit` | 兩店並列（頁首「價格・時間・交通」按鈕直達） | 來店相關頁面 |
| `/first-visit` | 第一次來店指南、兩店差異 | 來店相關頁面 |
| `/nukunuku/adoption` | 中途理念、等家的貓、認養流程、條件、費用、申請表 | NUKUNUKU → 認養說明 |
| `/nukunuku/graduates` | 畢業故事（需家人同意才能發布） | NUKUNUKU → 畢業故事 |
| `/cats` | 兩店所有貓咪 | — |
| `/news` | 消息（公告、活動、新貓咪、認養、媒體） | 最新消息 |
| `/faq` | 常見問題（依分類） | 常見問題 |
| `/playroom`、`/playroom/遊戲` | 貓咪遊樂室；遊戲網址可留空，顯示「即將推出」 | 貓咪遊樂室 |
| `/about`、`/privacy` | 品牌理念、隱私權政策 | 來店相關頁面／隱私權政策 |
| `/sitemap.xml`、`/robots.txt`、`/llms.txt` | 搜尋引擎與 AI 用，自動產生 | — |

**FUFU 不會出現認養功能**：`/fufu/adoption` 回 404；FUFU 的貓不能設成「可認養／媒合中／已畢業」，後台也看不到認養欄位。

---

## 二、後台怎麼用

**四種語言**：每個文字欄位先填繁體中文（必填），英日韓收在「其他語言」裡。沒翻譯的語言，官網暫時顯示中文並加上提示，且該頁不讓搜尋引擎收錄。後台清單會標示「缺 EN・JA・KO」。

**正式資訊的核對**
- 來店資訊（價格、時間、地址、規則）必須勾「資訊已核對」才能發布；按「核對並發布」會自動記錄核對日期，顯示在官網價格表下方。
- 畢業故事必須勾「家人已同意公開」才能發布。
- 系統不會放任何示意照片或價格到正式網站，都需管理員上傳、填寫並發布。

**常用操作**
- 臨時公休：網站設定 → 公告列 → 開啟、填文字，可設「自動下架時間」；並在來店資訊 → 特別營業日加入該日期，首頁的「今日營業」會自動顯示公休。
- 新增貓咪：FUFU 或 NUKUNUKU → 貓咪 → 全部 → 右上「＋」（會自動帶入所在店）。
- 下架消息：打開消息 → 右下角 ⋯ →「取消發布」。內容保留，之後可再發布。
- 頁尾連結（線上商店、合作店家）、社群連結：網站設定 → 連結。
- 發布前可先按「預覽」分頁看手機版效果；歷史紀錄可還原舊版本（免費方案保留 3 天）。

**權限**：只有受邀成員能登入後台；訪客只能讀取已發布內容。免費方案的可編輯成員都是管理員。

---

## 三、第一次設定

Sanity 已由 Claude 透過連接器設定完成（2026-10-18）：

- 專案：**FUFU × NUKUNUKU**（Project ID `z4pcrrck`，帳號 mikabebew@gmail.com）
- 資料集：`production`（公開讀取；草稿不公開）
- CORS：`http://localhost:3000`（允許登入）
- 固定頁面草稿 16 份已建立（等同已執行 `npm run setup:pages`）
- `.env.local` 已填好 Project ID 與兩組 token（另外提供，請勿上傳到 Git）

您只需要（Node.js 20.19 以上）：

1. 把 `.env.local` 放進專案資料夾根目錄。
2. `npm install`
3. `npm run dev` → 官網 http://localhost:3000 ，後台 http://localhost:3000/studio（用同一個 Google 帳號登入）

---

## 四、驗收

### A. 自動檢查
開著 `npm run dev`，另一個終端機執行 `npm run verify`。會實際測試：

1. 照片上傳、草稿、發布、自動縮圖與轉 WebP
2. 訪客讀不到草稿、無法寫入
3. 來店資訊是否有核對紀錄；FUFU 沒有認養狀態的貓；翻譯進度
4. 四種語言共 26 個網址可開啟；不存在的網址（含 `/fufu/adoption`）回 404
5. sitemap 含四語 hreflang；頁面含結構化資料

### B. 手動操作（用手機做一次）

| # | 操作 | 預期 |
|---|---|---|
| 1 | 填 FUFU 來店資訊（每週時間、價格、地址），不勾「已核對」按發布 | 無法發布 |
| 2 | 勾「已核對」→「核對並發布」 | 首頁「今日營業」顯示營業狀態與價格；價格表下方有核對日期 |
| 3 | 加一個今天日期的特別營業日（公休）→ 發布 | 首頁 FUFU 顯示「今日公休」 |
| 4 | 首頁上傳 3 張主視覺、拖曳排序 → 發布 | 首頁依序輪播，手機可左右滑 |
| 5 | 新增 FUFU 貓咪，狀態選「可認養」 | 出現紅字，無法發布 |
| 6 | 新增 NUKUNUKU 貓咪「可認養」、勾首頁精選 → 發布 | 出現在首頁、`/nukunuku`、`/nukunuku/adoption` |
| 7 | 只填中文 → 開 `/en/nukunuku/cats/代稱` | 顯示中文與「尚未提供英文」提示 |
| 8 | 補英文名字 → 發布 → 再開 | 顯示英文，提示消失 |
| 9 | 新增遊戲但不填網址 → 發布 | `/playroom` 顯示「即將推出」；補網址後變成「開始玩」 |
| 10 | 網站設定 → 頁尾連結加一個線上商店 → 發布 | 頁尾出現，點擊開新分頁 |
| 11 | 公告列開啟、設 1 分鐘後下架 | 出現，時間到後重新整理即消失 |
| 12 | 消息「取消發布」 | 列表消失，原網址 404 |
| 13 | 頁尾切換 EN／日本語／한국어 | 介面文字切換、網址加上語言前綴 |

---

## 五、SEO・GEO・AEO

- 每頁：標題、描述、canonical、四語 hreflang、分享圖（後台可覆寫，留空自動帶入）
- 結構化資料：Organization、WebSite、CafeOrCoffeeShop（地址、營業時間、特別營業日、價格範圍、付款）、BreadcrumbList、FAQPage、HowTo（第一次來店）、NewsArticle、Event（有填活動日期時）、Article（畢業故事）、VideoGame
- `/sitemap.xml`：貓咪、消息、遊戲、畢業故事只列出有翻譯的語言版本
- `/llms.txt`：兩店核對過的事實摘要，供 AI 搜尋引用
- 資訊頁一開頭就是答案（價格、時間、地址），方便問答引擎擷取

上線後到 Google Search Console 提交 `https://你的網址/sitemap.xml`。

---

## 六、上線（Vercel）

1. 推到 GitHub，在 Vercel 匯入。
2. 環境變數：`NEXT_PUBLIC_SANITY_PROJECT_ID`、`NEXT_PUBLIC_SANITY_DATASET`、`NEXT_PUBLIC_SANITY_API_VERSION`、`NEXT_PUBLIC_SITE_URL`、`SANITY_API_READ_TOKEN`（**不要**放 `SANITY_API_WRITE_TOKEN`）。
3. Sanity CORS origins 加入正式網址（勾 Allow credentials）。
4. `VERIFY_SITE_URL=https://你的網址 npm run verify`

---

## 七、需要您確認或提供

- 介面文字的英、日、韓翻譯（`messages/en.json`、`ja.json`、`ko.json`）由 Claude 翻譯，請找懂該語言的人核對。
- 兩個 Logo 的 SVG 或去背 PNG（放在 `public/brand/`）。
- 品牌色與字體寫在 `app/globals.css` 開頭，取自 Logo 原檔。

## 八、檔案結構

```
app/[locale]/            官網各頁（[brand] = fufu / nukunuku）
app/studio/              後台
app/sitemap.ts、robots.ts、llms.txt/
components/              版面元件（visit.tsx 為來店資訊）
i18n/、messages/         四語設定與介面文字
lib/                     共用選項、營業時間計算、SEO 與結構化資料
sanity/schemaTypes/      後台欄位
sanity/studio/           後台選單、預覽對應、核對並發布
scripts/                 初始化與驗收
```

---

## 養貓前必修課（/academy）

努酷貓養貓學院的闖關遊戲，8 堂課、151 題題庫，每次隨機抽題。

| 位置 | 說明 |
|---|---|
| `public/academy/` | 遊戲本體（單一 HTML 與角色圖），網址 `/academy` |
| `app/api/academy/*` | LINE 登入（login、callback、logout）、登入狀態（me）、每局成績回傳（run） |
| `lib/academy/` | 登入 cookie 簽章、寫入紀錄、題目清單（questions.json，題目 ID 與遊戲內順序一致） |
| 後台 → 必修課紀錄 | 玩家人數、每日遊玩、各課過關率、每題答錯率、完成 8 課名單（可下載 CSV） |

**紀錄存在哪裡**：同一個 Sanity 資料集，文件 ID 都以 `academy.` 開頭。Sanity 規定 ID 含「.」的文件只有登入後台或帶 token 才讀得到，所以玩家名稱不會出現在公開 API。

**不登入也能玩**：訪客的成績只計入遊玩次數和答錯率；用 LINE 登入的玩家才會留下名稱、徽章與成績。

### 上線前要設定的環境變數（Vercel → Settings → Environment Variables）

| 名稱 | 取得方式 |
|---|---|
| `LINE_LOGIN_CHANNEL_ID`、`LINE_LOGIN_CHANNEL_SECRET` | [LINE Developers](https://developers.line.biz/) 建立 **LINE Login** channel。Callback URL 填 `https://fufucatcafe.com.tw/api/academy/callback`；Scope 勾 `profile`、`openid` |
| `ACADEMY_SESSION_SECRET` | 至少 32 字元的隨機字串（終端機執行 `openssl rand -base64 48`） |
| `SANITY_ACADEMY_TOKEN` | sanity.io/manage → 專案 → API → Tokens → 新增 **Editor** 權限 token，命名 `academy-writer` |

沒設定時遊戲照常可玩，只是不顯示登入按鈕、也不記錄。
