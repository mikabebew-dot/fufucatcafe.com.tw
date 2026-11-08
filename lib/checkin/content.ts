/**
 * 入場確認系統（/checkin）的固定文字與預設值。
 * 價格、兒童規則、指定飲品等「會變動的正式資訊」以後台「來店資訊」為準，這裡只放後台沒填時的備用值。
 */
import type { BrandId } from "@/lib/constants";

export const LANGS = ["zh", "en", "ja", "ko"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** 網站各語言的網址前綴（繁中在根目錄） */
export const LOCALE_PREFIX: Record<Lang, string> = { zh: "", en: "/en", ja: "/ja", ko: "/ko" };
export const SPEECH_LANG: Record<Lang, string> = { zh: "zh-TW", en: "en-US", ja: "ja-JP", ko: "ko-KR" };
export const LANG_LABEL: Record<Lang, string> = { zh: "繁體中文", en: "English", ja: "日本語", ko: "한국어" };

export type L10n = Record<Lang, string>;

/** 後台「來店資訊 → 入場確認」沒填時的備用值（取自原本入場系統 V1.4） */
export const DEFAULTS: Record<BrandId, { shortDrinks: L10n; longMin: number }> = {
  fufu: {
    shortDrinks: { zh: "原味奶茶、綠茶", en: "Classic milk tea, green tea", ja: "ミルクティー、緑茶", ko: "밀크티, 녹차" },
    longMin: 220,
  },
  nukunuku: {
    shortDrinks: { zh: "原味奶茶、蜂蜜水", en: "Classic milk tea, honey water", ja: "ミルクティー、はちみつ水", ko: "밀크티, 꿀물" },
    longMin: 220,
  },
};

export const PRICE_PER_10 = 55;
export const PRICE_CAP_MIN = 100;

/** 和貓咪的約定（入場頁精簡版；完整版在官網「來店資訊」） */
export const RULES: { title: L10n; body: L10n }[] = [
  {
    title: { zh: "讓貓咪決定要不要靠近", en: "Let the cats come to you", ja: "近づくかは猫が決めます", ko: "다가올지는 고양이가 정해요" },
    body: {
      zh: "不追逐、不強抱、不拉扯。貓咪走開時，請讓牠走。",
      en: "No chasing, picking up or pulling. If a cat walks away, let it go.",
      ja: "追いかけたり、抱き上げたり、引っぱったりしないでください。離れていく猫はそっと見送ってください。",
      ko: "쫓거나 안거나 잡아당기지 말아 주세요. 고양이가 자리를 뜨면 그대로 보내 주세요.",
    },
  },
  {
    title: { zh: "睡覺、吃飯、躲起來時不打擾", en: "Don't disturb resting cats", ja: "寝ている猫はそっとしておく", ko: "쉬는 고양이는 방해하지 않기" },
    body: {
      zh: "請不要拍醒或伸手進貓窩，給牠們安心休息的空間。",
      en: "Please don't wake them or reach into their beds.",
      ja: "起こしたり、猫のベッドに手を入れたりしないでください。",
      ko: "깨우거나 숨숨집에 손을 넣지 말아 주세요.",
    },
  },
  {
    title: { zh: "不餵任何食物", en: "No feeding", ja: "食べ物はあげない", ko: "음식 주지 않기" },
    body: {
      zh: "人的食物、飲料、自備零食都不行。貓咪的飲食由店員照顧。",
      en: "No human food, drinks or your own treats. Our staff handle their meals.",
      ja: "人の食べ物・飲み物・持ち込みのおやつは与えないでください。食事はスタッフが管理しています。",
      ko: "사람 음식, 음료, 가져온 간식 모두 안 돼요. 식사는 직원이 챙겨요.",
    },
  },
  {
    title: { zh: "拍照請關閃光燈", en: "Photos yes, flash no", ja: "写真はOK、フラッシュはNG", ko: "사진 OK, 플래시 NO" },
    body: {
      zh: "也請不要為了拍照勉強貓咪。",
      en: "And please don't force a cat to pose.",
      ja: "撮影のために猫に無理をさせないでください。",
      ko: "사진을 위해 고양이를 억지로 붙잡지 말아 주세요.",
    },
  },
  {
    title: { zh: "進出記得關門", en: "Close the doors behind you", ja: "ドアは必ず閉める", ko: "드나들 때 문 닫기" },
    body: {
      zh: "開關門時留意腳邊，別讓貓咪跑出去。",
      en: "Check around your feet so no cat slips out.",
      ja: "足元を確認して、猫が外に出ないようにしてください。",
      ko: "발밑을 살펴 고양이가 나가지 않게 해 주세요.",
    },
  },
];

export const T = {
  welcome: { zh: "歡迎來到", en: "Welcome to", ja: "ようこそ", ko: "어서 오세요" },
  intro: {
    zh: "入場前，請花 1 分鐘看完三件事：費用、飲品方案、和貓咪的約定。",
    en: "Before you go in, take one minute for three things: prices, drink plans and how to be with the cats.",
    ja: "入店前に1分だけ、料金・ドリンクプラン・猫との約束の3つをご確認ください。",
    ko: "입장 전 1분만 시간을 내어 요금, 음료 플랜, 고양이와의 약속 세 가지를 확인해 주세요.",
  },
  notCharged: {
    zh: "閱讀時間不計費，入場時間由店員登記。",
    en: "Reading time isn't charged. Staff will record your entry time.",
    ja: "お読みいただく時間は料金に含まれません。入店時刻はスタッフが記録します。",
    ko: "읽는 시간은 요금에 포함되지 않아요. 입장 시간은 직원이 기록해요.",
  },
  chooseLang: { zh: "選擇語言", en: "Language", ja: "言語", ko: "언어" },
  start: { zh: "開始", en: "Start", ja: "はじめる", ko: "시작하기" },
  next: { zh: "下一步", en: "Next", ja: "次へ", ko: "다음" },
  back: { zh: "上一步", en: "Back", ja: "戻る", ko: "이전" },
  listen: { zh: "聆聽本頁", en: "Listen", ja: "読み上げ", ko: "듣기" },
  stop: { zh: "停止", en: "Stop", ja: "停止", ko: "정지" },
  stepOf: { zh: "第 {n} / 3 步", en: "Step {n} of 3", ja: "ステップ {n} / 3", ko: "{n} / 3 단계" },

  priceTitle: { zh: "費用", en: "Prices", ja: "料金", ko: "요금" },
  priceHead: {
    zh: "每人每 10 分鐘 NT${p}，最高 NT${cap}",
    en: "NT${p} per person per 10 min, up to NT${cap}",
    ja: "お一人様10分ごとにNT${p}、上限NT${cap}",
    ko: "1인 10분당 NT${p}, 최대 NT${cap}",
  },
  pricePoints: {
    zh: [
      "每位客人各自計費，不是整組合計。",
      "依實際停留時間，以 10 分鐘為單位四捨五入：34 分鐘算 30 分鐘，35 分鐘算 40 分鐘。",
      "滿 {capMin} 分鐘後不再加價，可以待到打烊。",
      "離場時在櫃檯結帳，只收現金和 LINE Pay，不收信用卡。",
    ],
    en: [
      "Each guest is charged separately, not per group.",
      "Billed by the time you stay, rounded to the nearest 10 minutes: 34 min counts as 30, 35 min as 40.",
      "After {capMin} minutes the price stops going up. Stay until closing.",
      "Pay at the counter when you leave. Cash or LINE Pay only, no credit cards.",
    ],
    ja: [
      "料金はお一人様ごとに計算します（グループ合計ではありません）。",
      "滞在時間を10分単位で四捨五入します：34分は30分、35分は40分として計算します。",
      "{capMin}分を超えると料金は上がりません。閉店までごゆっくりどうぞ。",
      "お会計はお帰りの際にカウンターで。現金・LINE Payのみ、クレジットカードは使えません。",
    ],
    ko: [
      "요금은 그룹 합계가 아니라 1인마다 따로 계산해요.",
      "머문 시간을 10분 단위로 반올림해요: 34분은 30분, 35분은 40분으로 계산해요.",
      "{capMin}분이 지나면 요금이 더 오르지 않아요. 영업 종료까지 머물러도 돼요.",
      "결제는 나가실 때 카운터에서. 현금과 LINE Pay만 가능하며 신용카드는 받지 않아요.",
    ],
  },
  calcTitle: { zh: "試算", en: "Estimate", ja: "料金の目安", ko: "요금 계산" },
  calcStay: { zh: "停留 {m} 分鐘", en: "Stay {m} min", ja: "{m}分滞在", ko: "{m}분 이용" },
  calcStayCap: { zh: "{m} 分鐘以上", en: "{m}+ min", ja: "{m}分以上", ko: "{m}분 이상" },
  calcPer: { zh: "每人 NT${v}", en: "NT${v} per person", ja: "お一人様 NT${v}", ko: "1인 NT${v}" },
  calcTotal: { zh: "{n} 人合計 NT${v}", en: "NT${v} for {n}", ja: "{n}名で NT${v}", ko: "{n}명 합계 NT${v}" },

  planTitle: { zh: "飲品方案（每人選一種）", en: "Drink plan (one per person)", ja: "ドリンクプラン（お一人様ひとつ）", ko: "음료 플랜 (1인 1개)" },
  planHint: {
    zh: "請用 ＋ － 填入每種方案的人數。",
    en: "Use + and − to set how many people choose each plan.",
    ja: "＋ − で各プランの人数を入れてください。",
    ko: "+ − 로 플랜별 인원을 입력해 주세요.",
  },
  shortName: { zh: "短暫停留", en: "Quick visit", ja: "ショート", ko: "짧은 방문" },
  shortWhen: { zh: "預計 30 分鐘內", en: "Planning 30 min or less", ja: "30分以内の予定", ko: "30분 이내 예정" },
  shortDrinks: { zh: "指定飲品暢飲：{d}", en: "Free refills of: {d}", ja: "指定ドリンク飲み放題：{d}", ko: "지정 음료 무제한: {d}" },
  shortUpgrade: {
    zh: "待超過 40 分鐘，自動升級成全品項暢飲，不另收費。",
    en: "Stay past 40 min and you're upgraded to all drinks at no extra charge.",
    ja: "40分を超えると、追加料金なしで全ドリンク飲み放題になります。",
    ko: "40분을 넘기면 추가 요금 없이 전 음료 무제한으로 바뀌어요.",
  },
  longName: { zh: "悠閒停留", en: "Relaxed stay", ja: "ゆったり", ko: "여유로운 방문" },
  longWhen: { zh: "預計 40 分鐘以上", en: "Planning 40 min or more", ja: "40分以上の予定", ko: "40분 이상 예정" },
  longDrinks: { zh: "全品項飲品暢飲", en: "Free refills of all drinks", ja: "全ドリンク飲み放題", ko: "전 음료 무제한" },
  longMin: {
    zh: "每人最低 NT${v}，提早離開也以 NT${v} 計。",
    en: "Minimum NT${v} per person, even if you leave early.",
    ja: "お一人様最低NT${v}（早くお帰りの場合も同額）。",
    ko: "1인 최소 NT${v}이며, 일찍 나가셔도 NT${v}이에요.",
  },
  people: { zh: "人", en: "", ja: "名", ko: "명" },
  partyTotal: { zh: "共 {n} 人", en: "{n} people in total", ja: "合計 {n} 名", ko: "총 {n}명" },
  needPeople: { zh: "請至少選 1 人", en: "Choose at least 1 person", ja: "1名以上を選んでください", ko: "1명 이상 선택해 주세요" },

  rulesTitle: { zh: "和貓咪的約定", en: "With the cats", ja: "猫との約束", ko: "고양이와의 약속" },
  rulesLead: {
    zh: "這裡是貓咪的家。牠們可以自己決定要不要互動，我們不保證每次都會被撒嬌。",
    en: "This is the cats' home. They decide whether to interact, so cuddles aren't guaranteed.",
    ja: "ここは猫たちのおうちです。触れ合うかどうかは猫が決めるので、毎回甘えてくれるとは限りません。",
    ko: "이곳은 고양이들의 집이에요. 교감할지는 고양이가 정하니, 매번 애교를 부리지는 않을 수 있어요.",
  },
  scratch: {
    zh: "如果被抓傷或咬傷，請馬上告訴店員。",
    en: "If you get scratched or bitten, tell our staff right away.",
    ja: "引っかかれたり噛まれたりしたら、すぐにスタッフへお知らせください。",
    ko: "긁히거나 물리면 바로 직원에게 알려 주세요.",
  },
  agree: {
    zh: "我已了解費用、付款方式（現金／LINE Pay）和以上約定",
    en: "I understand the prices, payment (cash / LINE Pay) and the rules above",
    ja: "料金・お支払い方法（現金／LINE Pay）と上記の約束を理解しました",
    ko: "요금, 결제 방법(현금 / LINE Pay), 위 약속을 이해했어요",
  },
  finish: { zh: "完成確認", en: "Confirm", ja: "確認する", ko: "확인 완료" },
  sending: { zh: "送出中…", en: "Sending…", ja: "送信中…", ko: "전송 중…" },

  doneTitle: { zh: "確認完成", en: "All set!", ja: "確認完了", ko: "확인 완료" },
  doneShow: {
    zh: "請把這個畫面給櫃檯店員看",
    en: "Please show this screen to our staff",
    ja: "この画面をスタッフにお見せください",
    ko: "이 화면을 직원에게 보여 주세요",
  },
  code: { zh: "確認碼", en: "Code", ja: "確認コード", ko: "확인 코드" },
  confirmedAt: { zh: "確認時間", en: "Confirmed", ja: "確認時刻", ko: "확인 시간" },
  restart: { zh: "下一組客人", en: "Next guests", ja: "次のお客様", ko: "다음 손님" },
  again: { zh: "重新填寫（換下一組）", en: "Start over (next group)", ja: "最初からやり直す（次のグループ）", ko: "처음부터 다시 (다음 그룹)" },

  fosterLink: {
    zh: "入座後，來認識正在等家的貓咪",
    en: "Once you're seated, meet the cats waiting for a home",
    ja: "お席に着いたら、おうちを待つ猫たちに会いに",
    ko: "자리에 앉으면, 가족을 기다리는 고양이들을 만나 보세요",
  },
  fosterPageTitle: { zh: "今天在店裡等家的孩子", en: "Cats waiting for a home today", ja: "今日おうちを待っている子たち", ko: "오늘 가족을 기다리는 아이들" },
  fosterPageTitleFufu: { zh: "姊妹店 NUKUNUKU 等家的孩子", en: "Cats waiting for a home at NUKUNUKU", ja: "姉妹店NUKUNUKUでおうちを待つ子たち", ko: "자매점 NUKUNUKU에서 가족을 기다리는 아이들" },
  fosterAsk: {
    zh: "想多認識哪一隻，歡迎直接問店員。",
    en: "Want to know more about one of them? Just ask our staff.",
    ja: "気になる子がいたら、スタッフに気軽に聞いてください。",
    ko: "궁금한 아이가 있으면 직원에게 편하게 물어보세요.",
  },
  fosterTitle: { zh: "這些孩子正在等一個家", en: "These cats are waiting for a home", ja: "おうちを待っている猫たち", ko: "가족을 기다리는 고양이들" },
  fosterLead: {
    zh: "NUKUNUKU 是中途貓咖啡廳。今天遇見的孩子，有些正在找家人，點照片可以認識牠。",
    en: "NUKUNUKU is a foster-cat café. Some of the cats you'll meet today are looking for a family. Tap a photo to get to know them.",
    ja: "NUKUNUKUは保護猫カフェです。今日出会う猫の中には、家族を探している子もいます。写真をタップして知ってください。",
    ko: "NUKUNUKU는 보호묘 카페예요. 오늘 만날 아이 중에는 가족을 찾는 아이들도 있어요. 사진을 눌러 알아봐 주세요.",
  },
  matching: { zh: "媒合中", en: "Matching", ja: "お見合い中", ko: "매칭 중" },
  adoptHow: { zh: "認養流程與條件", en: "How adoption works", ja: "譲渡の流れと条件", ko: "입양 절차와 조건" },
  fosterLeadFufu: {
    zh: "FUFU 的貓咪都是店貓。走路 3 分鐘的姊妹店 NUKUNUKU 是中途貓咖啡廳，這些孩子正在那裡找家人，點照片可以認識牠。",
    en: "FUFU's cats all live here for good. Our sister café NUKUNUKU, a 3-minute walk away, is a foster-cat café where these cats are looking for a family. Tap a photo to get to know them.",
    ja: "FUFUの猫はずっとここで暮らす店猫です。徒歩3分の姉妹店NUKUNUKUは保護猫カフェで、この子たちが家族を探しています。写真をタップして知ってください。",
    ko: "FUFU의 고양이들은 이곳에서 계속 사는 매장 고양이예요. 걸어서 3분 거리의 자매점 NUKUNUKU는 보호묘 카페로, 이 아이들이 가족을 찾고 있어요. 사진을 눌러 알아봐 주세요.",
  },
} satisfies Record<string, L10n | Record<Lang, string[]>>;

/** 取文字並代入 {變數} */
export function tr(entry: L10n, lang: Lang, vars: Record<string, string | number> = {}) {
  return (entry[lang] ?? entry.zh).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

/** 依停留分鐘數計算每人費用（10 分鐘四捨五入、上限 100 分鐘） */
export function perPerson(minutes: number, per10 = PRICE_PER_10) {
  const blocks = Math.min(PRICE_CAP_MIN / 10, Math.max(1, Math.round(minutes / 10)));
  return blocks * per10;
}
