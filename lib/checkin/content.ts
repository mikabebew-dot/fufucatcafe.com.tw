/**
 * 入場確認系統（/checkin）的固定文字與預設值。
 * 價格、兒童規則、指定飲品等「會變動的正式資訊」以後台「來店資訊」為準，這裡只放後台沒填時的備用值。
 */
import type { BrandId } from "@/lib/constants";

export const LANGS = ["zh", "en", "ja", "ko", "th", "vi", "id"] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

/** 網站各語言的網址前綴（繁中在根目錄；官網沒有泰、越、印尼文，連到英文版） */
export const LOCALE_PREFIX: Record<Lang, string> = { zh: "", en: "/en", ja: "/ja", ko: "/ko", th: "/en", vi: "/en", id: "/en" };
export const LANG_LABEL: Record<Lang, string> = {
  zh: "繁體中文", en: "English", ja: "日本語", ko: "한국어", th: "ภาษาไทย", vi: "Tiếng Việt", id: "Bahasa Indonesia",
};
/** 官網沒有內容的語言（貓咪介紹等後台資料改用英文） */
export const EN_FALLBACK: readonly Lang[] = ["th", "vi", "id"];

export type L10n = Record<Lang, string>;

/** 後台「來店資訊 → 入場確認」沒填時的備用值（取自原本入場系統 V1.4） */
export const DEFAULTS: Record<BrandId, { shortDrinks: L10n; longMin: number }> = {
  fufu: {
    shortDrinks: { zh: "原味奶茶、綠茶", en: "Classic milk tea, green tea", ja: "ミルクティー、緑茶", ko: "밀크티, 녹차", th: "ชานมรสดั้งเดิม, ชาเขียว", vi: "Trà sữa truyền thống, trà xanh", id: "Teh susu original, teh hijau" },
    longMin: 220,
  },
  nukunuku: {
    shortDrinks: { zh: "原味奶茶、蜂蜜水", en: "Classic milk tea, honey water", ja: "ミルクティー、はちみつ水", ko: "밀크티, 꿀물", th: "ชานมรสดั้งเดิม, น้ำผึ้ง", vi: "Trà sữa truyền thống, nước mật ong", id: "Teh susu original, air madu" },
    longMin: 220,
  },
};

/** 入場確認頁用的 Logo：FUFU 用裁到圓形邊緣的版本，Logo 會填滿圓框 */
export const checkinLogo = (brand: string, fallback: string) => (brand === "fufu" ? "/brand/fufu-logo-circle.png" : fallback);

/** 兩家店的地址（客滿時引導去另一家） */
export const STORE_ADDR: Record<BrandId, { addr: string; map: string }> = {
  fufu: { addr: "台北市萬華區武昌街二段53號3樓", map: "FUFU CAT CAFE 台北市萬華區武昌街二段53號" },
  nukunuku: { addr: "台北市萬華區漢口街二段20巷5號2樓", map: "NUKUNUKU CAT CAFE 台北市萬華區漢口街二段20巷5號" },
};

export const PRICE_PER_10 = 55;
export const PRICE_CAP_MIN = 100;

/** 和貓咪的約定（入場頁精簡版；完整版在官網「來店資訊」）。strong：用紅色卡片特別強調 */
export type Rule = { title: L10n; body: L10n; strong?: boolean };
export const RULES: Rule[] = [
  {
    strong: true,
    title: {
      zh: "勿強抱貓咪", en: "Do not hug or hold the cats", ja: "猫を抱っこしないでください", ko: "고양이를 억지로 안지 마세요",
      th: "ห้ามอุ้มหรือกอดแมว", vi: "Không ôm hay bế mèo", id: "Jangan memeluk atau menggendong kucing",
    },
    body: {
      zh: "請不要把貓咪抱起來、抱在腿上或緊緊抱住。想親近時，讓貓咪自己走過來。",
      en: "Please don't pick cats up, put them on your lap or hold them tight. If you'd like to be close, let the cat come to you.",
      ja: "抱き上げたり、膝にのせたり、ぎゅっと抱きしめたりしないでください。仲良くなりたいときは、猫から近づいてくるのを待ってください。",
      ko: "고양이를 들어 올리거나 무릎에 올리거나 꽉 안지 마세요. 친해지고 싶다면 고양이가 먼저 다가오게 해 주세요.",
      th: "กรุณาอย่าอุ้มแมวขึ้น วางบนตัก หรือกอดแน่น ถ้าอยากใกล้ชิด ให้แมวเดินเข้ามาหาเอง",
      vi: "Xin đừng bế mèo lên, đặt lên đùi hay ôm chặt. Muốn gần gũi, hãy để bé tự đến với bạn.",
      id: "Mohon jangan mengangkat kucing, memangkunya, atau memeluknya erat. Kalau ingin dekat, biarkan kucing yang menghampiri Anda.",
    },
  },
  {
    title: {
      zh: "讓貓咪決定要不要靠近", en: "Let the cats come to you", ja: "近づくかは猫が決めます", ko: "다가올지는 고양이가 정해요",
      th: "ให้แมวเป็นฝ่ายเข้ามาหาเอง", vi: "Để mèo tự quyết định có lại gần hay không", id: "Biarkan kucing yang mendekat",
    },
    body: {
      zh: "不追趕、不拉扯、不限制貓咪的行動。貓咪走開時，請讓牠走。",
      en: "No chasing, grabbing or blocking their way. If a cat walks away, let it go.",
      ja: "追いかけたり、引っぱったり、動きを妨げたりしないでください。離れていく猫はそっと見送ってください。",
      ko: "쫓거나 잡아당기거나 움직임을 막지 말아 주세요. 고양이가 자리를 뜨면 그대로 보내 주세요.",
      th: "ห้ามไล่ตาม ห้ามดึง ห้ามขวางทางแมว ถ้าแมวเดินหนี ปล่อยให้มันไปนะคะ",
      vi: "Không đuổi theo, không kéo, không cản đường mèo. Khi mèo bỏ đi, hãy để bé đi.",
      id: "Jangan mengejar, menarik, atau menghalangi gerak kucing. Kalau kucing pergi, biarkan saja.",
    },
  },
  {
    title: { zh: "睡覺、吃飯、躲起來時不打擾", en: "Don't disturb resting cats", ja: "寝ている猫はそっとしておく", ko: "쉬는 고양이는 방해하지 않기", th: "อย่ารบกวนแมวที่กำลังพักผ่อน", vi: "Không làm phiền mèo đang nghỉ", id: "Jangan ganggu kucing yang sedang istirahat" },
    body: {
      zh: "請不要拍醒或伸手進貓窩，給牠們安心休息的空間。",
      en: "Please don't wake them or reach into their beds.",
      ja: "起こしたり、猫のベッドに手を入れたりしないでください。",
      ko: "깨우거나 숨숨집에 손을 넣지 말아 주세요.",
      th: "กรุณาอย่าปลุกหรือยื่นมือเข้าไปในที่นอนของแมว",
      vi: "Xin đừng đánh thức hay thò tay vào ổ của mèo.",
      id: "Mohon jangan membangunkan atau memasukkan tangan ke tempat tidurnya.",
    },
  },
  {
    title: { zh: "不餵任何食物", en: "No feeding", ja: "食べ物はあげない", ko: "음식 주지 않기", th: "ห้ามให้อาหาร", vi: "Không cho ăn", id: "Dilarang memberi makan" },
    body: {
      zh: "人的食物、飲料、自備零食都不行。貓咪的飲食由店員照顧。",
      en: "No human food, drinks or your own treats. Our staff handle their meals.",
      ja: "人の食べ物・飲み物・持ち込みのおやつは与えないでください。食事はスタッフが管理しています。",
      ko: "사람 음식, 음료, 가져온 간식 모두 안 돼요. 식사는 직원이 챙겨요.",
      th: "ห้ามให้อาหารคน เครื่องดื่ม หรือขนมที่นำมาเอง พนักงานจะดูแลอาหารของแมวเอง",
      vi: "Không cho mèo ăn đồ ăn, đồ uống của người hay bánh thưởng tự mang. Nhân viên sẽ lo bữa ăn cho mèo.",
      id: "Tidak boleh makanan manusia, minuman, atau camilan bawaan sendiri. Makanan kucing diurus oleh staf.",
    },
  },
  {
    title: { zh: "拍照請關閃光燈", en: "Photos yes, flash no", ja: "写真はOK、フラッシュはNG", ko: "사진 OK, 플래시 NO", th: "ถ่ายรูปได้ แต่ห้ามใช้แฟลช", vi: "Được chụp ảnh, không dùng đèn flash", id: "Boleh foto, tanpa flash" },
    body: {
      zh: "也請不要為了拍照勉強貓咪。",
      en: "And please don't force a cat to pose.",
      ja: "撮影のために猫に無理をさせないでください。",
      ko: "사진을 위해 고양이를 억지로 붙잡지 말아 주세요.",
      th: "และกรุณาอย่าบังคับแมวเพื่อถ่ายรูป",
      vi: "Và xin đừng ép mèo tạo dáng để chụp ảnh.",
      id: "Dan mohon jangan memaksa kucing untuk berpose.",
    },
  },
  {
    title: { zh: "進出記得關門", en: "Close the doors behind you", ja: "ドアは必ず閉める", ko: "드나들 때 문 닫기", th: "ปิดประตูทุกครั้งที่เข้าออก", vi: "Nhớ đóng cửa khi ra vào", id: "Tutup pintu saat keluar masuk" },
    body: {
      zh: "開關門時留意腳邊，別讓貓咪跑出去。",
      en: "Check around your feet so no cat slips out.",
      ja: "足元を確認して、猫が外に出ないようにしてください。",
      ko: "발밑을 살펴 고양이가 나가지 않게 해 주세요.",
      th: "ดูบริเวณเท้าให้ดี อย่าให้แมวหลุดออกไป",
      vi: "Để ý dưới chân để mèo không chạy ra ngoài.",
      id: "Perhatikan sekitar kaki agar kucing tidak menyelinap keluar.",
    },
  },
];

/** 各店額外的約定（接在共同約定後面） */
export const EXTRA_RULES: Record<BrandId, Rule[]> = {
  fufu: [
    {
      title: { zh: "包包、外套請放指定置物櫃", en: "Bags and coats go in the lockers", ja: "バッグ・上着は指定のロッカーへ", ko: "가방과 외투는 지정 사물함에", th: "กรุณาเก็บกระเป๋าและเสื้อคลุมในล็อกเกอร์", vi: "Để túi xách và áo khoác vào tủ khóa", id: "Simpan tas dan jaket di loker" },
      body: {
        zh: "避免貓咪抓咬或鑽進包包裡，也讓座位區更寬敞。",
        en: "This keeps cats from scratching or crawling into them, and leaves more room to sit.",
        ja: "猫がひっかいたり中に入ったりしないよう、また席を広く使えるようにご協力ください。",
        ko: "고양이가 긁거나 안에 들어가지 않도록, 그리고 자리를 넓게 쓸 수 있도록 부탁드려요.",
        th: "เพื่อไม่ให้แมวข่วนหรือมุดเข้าไปในกระเป๋า และให้มีที่นั่งกว้างขึ้น",
        vi: "Để mèo không cào hay chui vào túi, và chỗ ngồi cũng rộng rãi hơn.",
        id: "Supaya kucing tidak mencakar atau masuk ke dalam tas, dan tempat duduk lebih lega.",
      },
    },
    {
      title: { zh: "進入綠色地毯區請脫鞋", en: "Shoes off on the green carpet", ja: "緑のカーペットでは靴を脱いでください", ko: "초록색 카펫 구역에서는 신발을 벗어 주세요", th: "กรุณาถอดรองเท้าบนพรมสีเขียว", vi: "Cởi giày khi vào khu thảm xanh", id: "Lepas sepatu di area karpet hijau" },
      body: {
        zh: "綠色地毯是貓咪休息玩耍的地方，請保持乾淨。",
        en: "The green carpet is where the cats rest and play, so please keep it clean.",
        ja: "緑のカーペットは猫たちが休んだり遊んだりする場所です。清潔にご協力ください。",
        ko: "초록색 카펫은 고양이들이 쉬고 노는 곳이니 깨끗하게 지켜 주세요.",
        th: "พรมสีเขียวเป็นที่พักและที่เล่นของแมว กรุณาช่วยรักษาความสะอาด",
        vi: "Thảm xanh là nơi mèo nghỉ ngơi và vui chơi, xin giữ sạch sẽ.",
        id: "Karpet hijau adalah tempat kucing beristirahat dan bermain, mohon dijaga kebersihannya.",
      },
    },
  ],
  nukunuku: [
    {
      title: {
        zh: "兒童禁止使用逗貓棒", en: "Children may not use cat teaser wands", ja: "お子様は猫じゃらしを使えません", ko: "어린이는 낚싯대 장난감을 사용할 수 없어요",
        th: "เด็กห้ามใช้ไม้ล่อแมว", vi: "Trẻ em không được dùng cần câu mèo", id: "Anak-anak tidak boleh memakai mainan pancing kucing",
      },
      body: {
        zh: "逗貓棒請由大人陪貓咪玩，避免小朋友和貓咪受傷。",
        en: "Teaser wands are for adults only, to keep both kids and cats safe.",
        ja: "猫じゃらしは大人の方がお使いください。お子様と猫のけがを防ぐためです。",
        ko: "낚싯대 장난감은 어른만 사용해 주세요. 아이와 고양이 모두 다치지 않도록 하기 위해서예요.",
        th: "ไม้ล่อแมวให้ผู้ใหญ่เป็นคนใช้เท่านั้น เพื่อความปลอดภัยของทั้งเด็กและแมว",
        vi: "Cần câu mèo chỉ dành cho người lớn, để cả trẻ em và mèo đều an toàn.",
        id: "Mainan pancing hanya untuk orang dewasa, agar anak-anak dan kucing sama-sama aman.",
      },
    },
  ],
};

/**
 * 圖片版約定（插圖來自 Canva「入場規定」設計，已上傳到後台圖片庫，這裡依格子裁切）。
 * 圖上已有中英文字，所以中、英文不另外顯示標題；其他語言在圖片下方顯示翻譯。
 */
const PIC_SRC: Record<BrandId, string> = {
  nukunuku: "https://cdn.sanity.io/images/z4pcrrck/production/6b05aa16d24548e24d5b4eec086eee8fddd5d106-2240x3178.png",
  fufu: "https://cdn.sanity.io/images/z4pcrrck/production/82426ab059815427b8f416bc9008f2d10d4f4183-2240x3178.png",
};
const pic = (brand: BrandId, rect: string) => `${PIC_SRC[brand]}?rect=${rect}&w=720&auto=format&q=80`;

export type PicRule = { img: string; title: L10n; strong?: boolean; kid?: Partial<L10n> };

const CHASE: L10n = {
  zh: "禁止追趕或限制貓咪行動", en: "Don't chase, grab or restrict the cats", ja: "猫を追いかけたり、動きを妨げたりしない", ko: "고양이를 쫓거나 움직임을 막지 않기",
  th: "ห้ามไล่ตาม จับ หรือขวางทางแมว", vi: "Không đuổi theo, níu giữ hay cản đường mèo", id: "Jangan mengejar, menangkap, atau menghalangi kucing",
};
const ESCAPE: L10n = {
  zh: "進出貓室門注意腳邊，避免貓咪逃脫", en: "Watch your step at the cat-room door so no cat escapes", ja: "猫部屋の出入りは足元に注意し、脱走を防いでください", ko: "고양이 방을 드나들 때 발밑을 살펴 탈출을 막아 주세요",
  th: "เข้าออกห้องแมวระวังเท้า อย่าให้แมวหลุดออกไป", vi: "Ra vào phòng mèo chú ý dưới chân, tránh để mèo chạy thoát", id: "Perhatikan kaki saat keluar masuk ruang kucing agar kucing tidak kabur",
};

/** 小朋友版的一句話（NUKUNUKU）：中英對照、越短越好，主要看圖 */
const KID = {
  hug: { zh: "不要抱貓咪，等牠自己走過來。", en: "Don't pick up the cats. Let them come to you." },
  flash: { zh: "拍照不開閃光燈。", en: "No flash when you take photos." },
  door: { zh: "進出記得關門。", en: "Always close the door." },
  feed: { zh: "不給貓咪吃我們的食物。", en: "Don't share your food with the cats." },
  wand: { zh: "逗貓棒讓大人來玩。", en: "Teaser wands are for grown-ups." },
  chase: { zh: "貓咪走開時不要追。", en: "Don't chase the cats." },
};

/** FUFU「一張一張看」的短句（中英對照） */
const STEP_FUFU = {
  hug: { zh: "不要強抱貓咪，等牠自己走過來。", en: "Don't pick up the cats. Let them come to you." },
  flash: { zh: "拍照不開閃光燈。", en: "No flash when you take photos." },
  door: { zh: "進出請隨手關門。", en: "Please close the door behind you." },
  feed: { zh: "不餵貓咪吃人類的食物。", en: "Don't feed the cats human food." },
  escape: { zh: "進出貓室門注意腳邊，別讓貓咪跑出去。", en: "Watch your step at the door so no cat slips out." },
  chase: { zh: "不追趕、不限制貓咪行動。", en: "Don't chase or hold back the cats." },
};

export const PIC_RULES: Record<BrandId, PicRule[]> = {
  nukunuku: [
    { img: pic("nukunuku", "78,251,657,597"), title: RULES[0].title, strong: true, kid: KID.hug },
    { img: pic("nukunuku", "765,251,711,597"), title: RULES[4].title, kid: KID.flash },
    { img: pic("nukunuku", "1493,251,669,597"), title: RULES[5].title, kid: KID.door },
    { img: pic("nukunuku", "78,854,657,591"), title: RULES[3].title, kid: KID.feed },
    { img: pic("nukunuku", "765,854,711,591"), title: EXTRA_RULES.nukunuku[0].title, kid: KID.wand },
    { img: pic("nukunuku", "1493,854,669,591"), title: CHASE, kid: KID.chase },
  ],
  fufu: [
    { img: pic("fufu", "96,269,651,591"), title: RULES[0].title, strong: true, kid: STEP_FUFU.hug },
    { img: pic("fufu", "765,269,699,591"), title: RULES[4].title, kid: STEP_FUFU.flash },
    { img: pic("fufu", "1469,269,681,591"), title: RULES[5].title, kid: STEP_FUFU.door },
    { img: pic("fufu", "96,872,651,573"), title: RULES[3].title, kid: STEP_FUFU.feed },
    { img: pic("fufu", "765,872,699,573"), title: ESCAPE, kid: STEP_FUFU.escape },
    { img: pic("fufu", "1469,872,681,573"), title: CHASE, kid: STEP_FUFU.chase },
  ],
};

/** 插圖沒有畫到、用文字補充的提醒 */
export const MORE_RULES: Record<BrandId, Rule[]> = {
  nukunuku: [RULES[2]],
  fufu: [RULES[2], ...EXTRA_RULES.fufu],
};

export const T = {
  welcome: { zh: "歡迎光臨", en: "Welcome to", ja: "ようこそ", ko: "어서 오세요", th: "ยินดีต้อนรับสู่", vi: "Chào mừng đến với", id: "Selamat datang di" },
  intro: {
    zh: "為了讓您和貓咪都有愉快的時光，\n入場前請花一點時間閱讀以下說明。",
    en: "So that you and the cats can have a lovely time,\nplease take a moment to read the following before you enter.",
    ja: "お客様と猫たちが楽しい時間を過ごせるよう、\nご入店前に以下のご案内をお読みください。",
    ko: "고객님과 고양이 모두 즐거운 시간을 보낼 수 있도록,\n입장 전에 아래 안내를 잠시 읽어 주세요.",
    th: "เพื่อให้คุณและแมวๆ ได้ใช้เวลาร่วมกันอย่างมีความสุข\nกรุณาสละเวลาอ่านข้อมูลต่อไปนี้ก่อนเข้าร้าน",
    vi: "Để bạn và các bé mèo có khoảng thời gian vui vẻ,\nvui lòng dành chút thời gian đọc hướng dẫn sau trước khi vào.",
    id: "Agar Anda dan para kucing bisa menikmati waktu bersama,\nmohon luangkan waktu sejenak untuk membaca informasi berikut sebelum masuk.",
  },
  infoTime: { zh: "約需 1–2 分鐘", en: "Takes about 1–2 minutes", ja: "所要時間は約1〜2分", ko: "약 1~2분 소요", th: "ใช้เวลาประมาณ 1–2 นาที", vi: "Mất khoảng 1–2 phút", id: "Sekitar 1–2 menit" },
  infoStaff: {
    zh: "完成閱讀後，櫃檯人員會協助您確認飲品與辦理入場。",
    en: "When you're done, our staff will confirm your drinks and check you in.",
    ja: "お読みいただいた後、スタッフがドリンクの確認とご入店の手続きをいたします。",
    ko: "다 읽으신 후 직원이 음료 확인과 입장 수속을 도와드려요.",
    th: "เมื่ออ่านจบแล้ว พนักงานจะช่วยยืนยันเครื่องดื่มและพาคุณเข้าร้าน",
    vi: "Đọc xong, nhân viên sẽ xác nhận đồ uống và làm thủ tục vào cửa cho bạn.",
    id: "Setelah selesai, staf kami akan mengonfirmasi minuman dan membantu Anda masuk.",
  },
  infoNotCharged: {
    zh: "閱讀期間尚未開始計算入場時間。",
    en: "Your time doesn't start while you're reading.",
    ja: "お読みいただいている間は、入店時間に含まれません。",
    ko: "읽는 동안에는 이용 시간이 계산되지 않아요.",
    th: "ระหว่างอ่าน ยังไม่เริ่มนับเวลา",
    vi: "Thời gian đọc chưa được tính vào thời gian lưu lại.",
    id: "Waktu membaca belum dihitung.",
  },
  backHome: { zh: "回到首頁", en: "Back to home", ja: "トップに戻る", ko: "처음으로", th: "กลับหน้าแรก", vi: "Về trang đầu", id: "Kembali ke awal" },
  startLong: { zh: "開始了解入場資訊", en: "See entry info", ja: "ご入店案内を見る", ko: "입장 안내 보기", th: "ดูข้อมูลการเข้าร้าน", vi: "Xem thông tin vào cửa", id: "Lihat info masuk" },
  chooseLangPrompt: { zh: "請選擇語言", en: "Please choose your language", ja: "言語を選択してください", ko: "언어를 선택해 주세요", th: "กรุณาเลือกภาษา", vi: "Vui lòng chọn ngôn ngữ", id: "Silakan pilih bahasa" },
  chooseLang: { zh: "選擇語言", en: "Language", ja: "言語", ko: "언어", th: "ภาษา", vi: "Ngôn ngữ", id: "Bahasa" },
  next: { zh: "下一步", en: "Next", ja: "次へ", ko: "다음", th: "ถัดไป", vi: "Tiếp", id: "Lanjut" },
  back: { zh: "上一步", en: "Back", ja: "戻る", ko: "이전", th: "ย้อนกลับ", vi: "Quay lại", id: "Kembali" },
  headerSub: { zh: "入場確認", en: "Check-in", ja: "ご入店案内", ko: "입장 안내", th: "ยืนยันการเข้าร้าน", vi: "Xác nhận vào cửa", id: "Check-in" },
  stepLabels: {
    zh: ["歡迎光臨", "低消與暢飲", "和貓咪的約定", "確認完成"],
    en: ["Welcome", "Minimum charge", "With the cats", "All set"],
    ja: ["ようこそ", "最低料金", "猫との約束", "確認完了"],
    ko: ["환영합니다", "최소 요금", "고양이와의 약속", "확인 완료"],
    th: ["ยินดีต้อนรับ", "ค่าขั้นต่ำ", "ข้อตกลงกับแมว", "เรียบร้อย"],
    vi: ["Chào mừng", "Phí tối thiểu", "Lời hứa với mèo", "Hoàn tất"],
    id: ["Selamat datang", "Biaya minimum", "Janji dengan kucing", "Selesai"],
  },

  priceTitle: {
    zh: "低消｜計時暢飲",
    en: "Minimum charge｜Timed, free-flow drinks",
    ja: "最低料金｜時間制・飲み放題",
    ko: "최소 이용 요금｜시간제・음료 무제한",
    th: "ค่าใช้จ่ายขั้นต่ำ｜คิดตามเวลา・ดื่มไม่อั้น",
    vi: "Phí tối thiểu｜Tính giờ・Uống thoải mái",
    id: "Biaya minimum｜Per waktu・Minum sepuasnya",
  },
  priceSub: {
    zh: "每人依停留時間計費，含飲品暢飲",
    en: "Charged per person by length of stay, drinks included",
    ja: "お一人様ごとに滞在時間で計算、ドリンク飲み放題付き",
    ko: "1인 이용 시간 기준 요금, 음료 무제한 포함",
    th: "คิดค่าบริการรายคนตามเวลาที่อยู่ รวมเครื่องดื่มไม่อั้น",
    vi: "Tính theo thời gian lưu lại mỗi người, bao gồm đồ uống thoải mái",
    id: "Dihitung per orang sesuai lama waktu, termasuk minum sepuasnya",
  },
  priceHead: {
    zh: "每人低消：每 10 分鐘 NT${p}，最高 NT${cap}",
    en: "Minimum charge: NT${p} per person per 10 min, up to NT${cap}",
    ja: "最低料金：お一人様10分ごとにNT${p}、上限NT${cap}",
    ko: "최소 이용 요금: 1인 10분당 NT${p}, 최대 NT${cap}",
    th: "ค่าขั้นต่ำ: คนละ NT${p} ต่อ 10 นาที สูงสุด NT${cap}",
    vi: "Phí tối thiểu: NT${p} mỗi người cho mỗi 10 phút, tối đa NT${cap}",
    id: "Biaya minimum: NT${p} per orang per 10 menit, maksimal NT${cap}",
  },
  mealTag: {
    zh: "餐點另計・用餐時間照常計時",
    en: "Food is charged separately · Meal time still counts toward your stay",
    ja: "お食事は別料金・お食事中も時間に含まれます",
    ko: "식사는 별도 요금 · 식사 시간도 이용 시간에 포함돼요",
    th: "อาหารคิดแยก・เวลาทานอาหารนับรวมด้วย",
    vi: "Đồ ăn tính riêng・Thời gian ăn vẫn được tính giờ",
    id: "Makanan dibayar terpisah・Waktu makan tetap dihitung",
  },
  pricePoints: {
    zh: [
      "每位客人各自計費，不是整組合計。",
      "依實際停留時間計費，**用餐時間也算在內**，以 10 分鐘四捨五入：34 分算 30，35 分算 40。",
      "滿 {capMin} 分鐘後不再加價，可以待到打烊。",
      "離場時在櫃檯結帳，只收現金和 LINE Pay，不收信用卡。",
    ],
    en: [
      "Each guest is charged separately, not per group.",
      "Billed by the time you stay, **including time spent eating**, rounded to the nearest 10 minutes: 34 min counts as 30, 35 min as 40.",
      "After {capMin} minutes the price stops going up. Stay until closing.",
      "Pay at the counter when you leave. Cash or LINE Pay only, no credit cards.",
    ],
    ja: [
      "料金はお一人様ごとに計算します（グループ合計ではありません）。",
      "滞在時間で計算し、**お食事の時間も含みます**。10分単位で四捨五入：34分は30分、35分は40分。",
      "{capMin}分を超えると料金は上がりません。閉店までごゆっくりどうぞ。",
      "お会計はお帰りの際にカウンターで。現金・LINE Payのみ、クレジットカードは使えません。",
    ],
    ko: [
      "요금은 그룹 합계가 아니라 1인마다 따로 계산해요.",
      "머문 시간으로 계산하며 **식사 시간도 포함돼요**. 10분 단위 반올림: 34분은 30분, 35분은 40분.",
      "{capMin}분이 지나면 요금이 더 오르지 않아요. 영업 종료까지 머물러도 돼요.",
      "결제는 나가실 때 카운터에서. 현금과 LINE Pay만 가능하며 신용카드는 받지 않아요.",
    ],
    th: [
      "คิดค่าบริการเป็นรายคน ไม่ใช่รวมทั้งกลุ่ม",
      "คิดตามเวลาที่อยู่จริง **รวมเวลาทานอาหารด้วย** ปัดเศษทีละ 10 นาที: 34 นาทีคิด 30, 35 นาทีคิด 40",
      "ครบ {capMin} นาทีแล้วไม่คิดเพิ่ม อยู่ได้จนร้านปิด",
      "ชำระเงินที่เคาน์เตอร์ตอนออก รับเฉพาะเงินสดและ LINE Pay ไม่รับบัตรเครดิต",
    ],
    vi: [
      "Tính tiền theo từng người, không tính gộp cả nhóm.",
      "Tính theo thời gian thực tế, **kể cả thời gian ăn**, làm tròn theo 10 phút: 34 phút tính 30, 35 phút tính 40.",
      "Sau {capMin} phút không tính thêm, có thể ở đến khi quán đóng cửa.",
      "Thanh toán tại quầy khi ra về. Chỉ nhận tiền mặt và LINE Pay, không nhận thẻ tín dụng.",
    ],
    id: [
      "Biaya dihitung per orang, bukan per grup.",
      "Dihitung sesuai lama waktu, **termasuk waktu makan**, dibulatkan per 10 menit: 34 menit dihitung 30, 35 menit dihitung 40.",
      "Setelah {capMin} menit tidak ada biaya tambahan, boleh tinggal sampai tutup.",
      "Bayar di kasir saat keluar. Hanya tunai dan LINE Pay, tidak menerima kartu kredit.",
    ],
  },
  calcTitle: { zh: "停留時間費用試算", en: "How much for how long?", ja: "滞在時間の料金シミュレーション", ko: "이용 시간별 요금 계산", th: "คำนวณค่าบริการตามเวลา", vi: "Tính thử chi phí theo thời gian", id: "Simulasi biaya sesuai lama waktu" },
  calcHint: { zh: "拖動圓點，看看待多久要付多少", en: "Drag the dot to see the price for each length of stay", ja: "丸をドラッグして、滞在時間ごとの料金を確認できます", ko: "점을 끌어서 이용 시간별 요금을 확인해 보세요", th: "ลากจุดเพื่อดูว่าอยู่นานเท่าไรต้องจ่ายเท่าไร", vi: "Kéo chấm tròn để xem ở bao lâu thì trả bao nhiêu", id: "Geser titiknya untuk melihat biaya sesuai lama waktu" },
  calcMin: { zh: "10 分", en: "10 min", ja: "10分", ko: "10분", th: "10 นาที", vi: "10 phút", id: "10 mnt" },
  calcMax: { zh: "100 分以上", en: "100+ min", ja: "100分以上", ko: "100분 이상", th: "100 นาทีขึ้นไป", vi: "Từ 100 phút", id: "100+ mnt" },
  calcNote: { zh: "這只是參考，實際費用依離場時間在櫃檯結算。", en: "This is only an estimate. The actual fee is based on when you leave and is settled at the counter.", ja: "あくまで目安です。実際の料金はご退店時間をもとにカウンターで精算します。", ko: "참고용이에요. 실제 요금은 퇴장 시간 기준으로 카운터에서 정산해요.", th: "เป็นเพียงการประมาณ ค่าบริการจริงคิดตามเวลาที่ออกจากร้านและชำระที่เคาน์เตอร์", vi: "Đây chỉ là ước tính. Chi phí thực tế tính theo giờ bạn rời quán và thanh toán tại quầy.", id: "Ini hanya perkiraan. Biaya sebenarnya dihitung sesuai waktu keluar dan dibayar di kasir." },
  calcStay: { zh: "停留 {m} 分鐘", en: "Stay {m} min", ja: "{m}分滞在", ko: "{m}분 이용", th: "อยู่ {m} นาที", vi: "Ở {m} phút", id: "{m} menit" },
  calcStayCap: { zh: "{m} 分鐘以上", en: "{m}+ min", ja: "{m}分以上", ko: "{m}분 이상", th: "{m} นาทีขึ้นไป", vi: "Từ {m} phút", id: "{m}+ menit" },
  calcPer: { zh: "每人 NT${v}", en: "NT${v} per person", ja: "お一人様 NT${v}", ko: "1인 NT${v}", th: "คนละ NT${v}", vi: "Mỗi người NT${v}", id: "NT${v} per orang" },
  calcTotal: { zh: "{n} 人合計 NT${v}", en: "NT${v} for {n}", ja: "{n}名で NT${v}", ko: "{n}명 합계 NT${v}", th: "{n} คน รวม NT${v}", vi: "{n} người tổng NT${v}", id: "{n} orang total NT${v}" },

  planTitle: { zh: "飲品方案（每人選一種）", en: "Drink plan (one per person)", ja: "ドリンクプラン（お一人様ひとつ）", ko: "음료 플랜 (1인 1개)", th: "แพ็กเกจเครื่องดื่ม (คนละ 1 แบบ)", vi: "Gói đồ uống (mỗi người chọn một)", id: "Paket minuman (satu per orang)" },
  planHint: {
    zh: "請用 ＋ － 填入每種方案的人數。",
    en: "Use + and − to set how many people choose each plan.",
    ja: "＋ − で各プランの人数を入れてください。",
    ko: "+ − 로 플랜별 인원을 입력해 주세요.",
    th: "กด + − เพื่อใส่จำนวนคนของแต่ละแพ็กเกจ",
    vi: "Dùng + − để nhập số người cho mỗi gói.",
    id: "Gunakan + − untuk mengisi jumlah orang tiap paket.",
  },
  shortName: { zh: "短暫停留", en: "Quick visit", ja: "ショート", ko: "짧은 방문", th: "แวะสั้นๆ", vi: "Ghé nhanh", id: "Kunjungan singkat" },
  shortWhen: { zh: "30 分鐘以內", en: "30 min or less", ja: "30分以内", ko: "30분 이내", th: "ไม่เกิน 30 นาที", vi: "Tối đa 30 phút", id: "Maks. 30 menit" },
  shortDrinks: { zh: "指定飲品暢飲：{d}", en: "Free refills of: {d}", ja: "指定ドリンク飲み放題：{d}", ko: "지정 음료 무제한: {d}", th: "ดื่มได้ไม่อั้น: {d}", vi: "Uống thoải mái: {d}", id: "Isi ulang gratis: {d}" },
  shortUpgrade: {
    zh: "待超過 40 分鐘，自動升級成全品項暢飲，不另收費。",
    en: "Stay past 40 min and you're upgraded to all drinks at no extra charge.",
    ja: "40分を超えると、追加料金なしで全ドリンク飲み放題になります。",
    ko: "40분을 넘기면 추가 요금 없이 전 음료 무제한으로 바뀌어요.",
    th: "ถ้าอยู่เกิน 40 นาที จะอัปเกรดเป็นดื่มได้ทุกเมนูโดยไม่เสียเพิ่ม",
    vi: "Ở quá 40 phút sẽ tự động được uống tất cả đồ uống, không tính thêm.",
    id: "Lebih dari 40 menit otomatis bisa semua minuman tanpa biaya tambahan.",
  },
  longName: { zh: "悠閒停留", en: "Relaxed stay", ja: "ゆったり", ko: "여유로운 방문", th: "นั่งชิลล์", vi: "Thong thả", id: "Santai" },
  longWhen: { zh: "40 分鐘以上", en: "40 min or more", ja: "40分以上", ko: "40분 이상", th: "40 นาทีขึ้นไป", vi: "Từ 40 phút", id: "40 menit ke atas" },
  longDrinks: { zh: "全品項飲品暢飲", en: "Free refills of all drinks", ja: "全ドリンク飲み放題", ko: "전 음료 무제한", th: "ดื่มได้ไม่อั้นทุกเมนู", vi: "Uống thoải mái tất cả đồ uống", id: "Isi ulang gratis semua minuman" },
  longMin: {
    zh: "每人最低 NT${v}，提早離開也以 NT${v} 計。",
    en: "Minimum NT${v} per person, even if you leave early.",
    ja: "お一人様最低NT${v}（早くお帰りの場合も同額）。",
    ko: "1인 최소 NT${v}이며, 일찍 나가셔도 NT${v}이에요.",
    th: "ขั้นต่ำคนละ NT${v} แม้จะออกก่อนก็คิด NT${v}",
    vi: "Tối thiểu NT${v} mỗi người, về sớm vẫn tính NT${v}.",
    id: "Minimal NT${v} per orang, meskipun pulang lebih awal.",
  },
  people: { zh: "人", en: "", ja: "名", ko: "명", th: "คน", vi: "người", id: "orang" },
  partyTotal: { zh: "共 {n} 人", en: "{n} people in total", ja: "合計 {n} 名", ko: "총 {n}명", th: "รวม {n} คน", vi: "Tổng {n} người", id: "Total {n} orang" },
  needPeople: { zh: "請至少選 1 人", en: "Choose at least 1 person", ja: "1名以上を選んでください", ko: "1명 이상 선택해 주세요", th: "กรุณาเลือกอย่างน้อย 1 คน", vi: "Vui lòng chọn ít nhất 1 người", id: "Pilih minimal 1 orang" },

  picGuideOpen: { zh: "看圖片版說明", en: "See the picture guide", ja: "イラストで見る", ko: "그림으로 보기", th: "ดูคำอธิบายแบบรูปภาพ", vi: "Xem hướng dẫn bằng hình", id: "Lihat panduan bergambar" },
  picGuideOpenSub: { zh: "和貓咪的約定・一看就懂", en: "Cat rules at a glance", ja: "猫との約束がひと目でわかる", ko: "고양이와의 약속을 한눈에", th: "ข้อตกลงกับแมวแบบเข้าใจง่าย", vi: "Lời hứa với mèo, nhìn là hiểu", id: "Aturan kucing sekilas pandang" },
  picGuideOpenSubKids: { zh: "和貓咪的約定・有小朋友版", en: "Cat rules, with a kids' version", ja: "猫との約束・こども版あり", ko: "고양이와의 약속・어린이 버전 있음", th: "ข้อตกลงกับแมว・มีเวอร์ชันเด็ก", vi: "Lời hứa với mèo・có bản cho bé", id: "Aturan kucing・ada versi anak" },
  picGuideTitle: { zh: "圖片版說明", en: "Picture guide", ja: "イラストでご案内", ko: "그림으로 보는 안내", th: "คำอธิบายแบบรูปภาพ", vi: "Hướng dẫn bằng hình", id: "Panduan bergambar" },
  picGuideBack: { zh: "看完了，回到入場確認", en: "Done, back to check-in", ja: "読みました・入場確認に戻る", ko: "다 봤어요, 입장 확인으로", th: "ดูแล้ว กลับไปยืนยันการเข้าร้าน", vi: "Xem xong, quay lại xác nhận", id: "Selesai, kembali ke check-in" },
  picHint: { zh: "點圖片可以放大", en: "Tap a picture to enlarge", ja: "画像をタップすると拡大します", ko: "그림을 누르면 크게 볼 수 있어요", th: "แตะรูปเพื่อขยาย", vi: "Chạm vào hình để phóng to", id: "Ketuk gambar untuk memperbesar" },
  moreTitle: { zh: "還有這些提醒", en: "A few more things", ja: "そのほかのお願い", ko: "그 밖의 안내", th: "ข้อควรทราบเพิ่มเติม", vi: "Thêm vài lưu ý", id: "Beberapa hal lainnya" },
  close: { zh: "關閉", en: "Close", ja: "閉じる", ko: "닫기", th: "ปิด", vi: "Đóng", id: "Tutup" },
  kidsOpen: { zh: "有小朋友一起來嗎？和小朋友一起看", en: "With kids? Read it together", ja: "お子さま連れの方へ：いっしょに見よう", ko: "아이와 함께 오셨나요? 같이 봐요", th: "มากับเด็กไหม? ดูด้วยกันเลย", vi: "Đi cùng bé? Cùng xem nhé", id: "Bersama anak? Lihat bersama" },
  kidsOpenSub: { zh: "小朋友版：一張一張看，蓋滿 6 個貓掌印", en: "Kids' version: one picture at a time, collect 6 paw stamps", ja: "こども版：1まいずつ見て、肉球スタンプを6こ集めよう", ko: "어린이 버전: 한 장씩 보고 발도장 6개 모으기", th: "เวอร์ชันเด็ก: ดูทีละรูป สะสมรอยเท้าแมว 6 อัน", vi: "Bản cho bé: xem từng hình, sưu tập 6 dấu chân mèo", id: "Versi anak: satu gambar per halaman, kumpulkan 6 cap kaki" },
  stepOpen: { zh: "一張一張看", en: "One picture at a time", ja: "1枚ずつ見る", ko: "한 장씩 보기", th: "ดูทีละรูป", vi: "Xem từng hình", id: "Lihat satu per satu" },
  stepOpenSub: { zh: "看完一張按一下，蓋滿 6 個貓掌印", en: "Tap after each one and collect 6 paw stamps", ja: "1枚ごとにタップして肉球スタンプを6こ集めよう", ko: "한 장 볼 때마다 눌러서 발도장 6개 모으기", th: "ดูแล้วแตะ สะสมรอยเท้าแมว 6 อัน", vi: "Xem xong chạm một lần, sưu tập 6 dấu chân mèo", id: "Ketuk tiap selesai, kumpulkan 6 cap kaki" },
  stepDoneTag: { zh: "已看完", en: "Done", ja: "見ました", ko: "완료", th: "ดูครบแล้ว", vi: "Đã xem xong", id: "Selesai" },
  stepTitle: { zh: "一張一張看", en: "One at a time" } as unknown as L10n,
  stepDo: { zh: "我知道了！", en: "Got it!" } as unknown as L10n,
  stepDoneTitle: { zh: "謝謝你和貓咪做好約定！", en: "Thanks for keeping our cats' promises!" } as unknown as L10n,
  stepDoneBody: { zh: "祝你在 FUFU 度過愉快的時光。", en: "Enjoy your time at FUFU!" } as unknown as L10n,
  stepBack: { zh: "回到圖片版說明", en: "Back to the picture guide" } as unknown as L10n,
  kidsTitle: { zh: "和貓咪做好朋友", en: "Be the cats' friend", ja: "ねこと なかよく なろう", ko: "고양이랑 친구 되기", th: "มาเป็นเพื่อนกับแมวกัน", vi: "Làm bạn với mèo nhé", id: "Ayo berteman dengan kucing" },
  kidsDo: { zh: "我會做到！", en: "I can do it!", ja: "まもれるよ！", ko: "할 수 있어요!", th: "ทำได้!", vi: "Con làm được!", id: "Aku bisa!" },
  kidsDoneTitle: { zh: "你是貓咪的好朋友！", en: "You're a friend of the cats!", ja: "きみは ねこの ともだちだね！", ko: "너는 고양이의 친구야!", th: "หนูเป็นเพื่อนของแมวแล้ว!", vi: "Con là bạn của các bé mèo rồi!", id: "Kamu teman kucing!" },
  kidsDoneBody: { zh: "最後一個約定：要和爸爸媽媽待在同一層樓喔。", en: "One last promise: stay on the same floor as your grown-up.", ja: "さいごの やくそく：おうちの ひとと おなじ かいに いてね。", ko: "마지막 약속: 엄마 아빠랑 같은 층에 있어요.", th: "สัญญาข้อสุดท้าย: อยู่ชั้นเดียวกับผู้ปกครองนะ", vi: "Lời hứa cuối: luôn ở cùng tầng với bố mẹ nhé.", id: "Janji terakhir: tetap di lantai yang sama dengan orang tuamu." },
  kidsBack: { zh: "交給大人完成確認", en: "Hand back to a grown-up", ja: "おとなの ひとに わたしてね", ko: "어른에게 돌려주기", th: "ส่งให้ผู้ใหญ่ยืนยัน", vi: "Đưa lại cho người lớn", id: "Serahkan ke orang dewasa" },
  kidsDoneTag: { zh: "小朋友已看完", en: "Kids have read it", ja: "こども版 読みました", ko: "어린이 버전 완료", th: "เด็กดูครบแล้ว", vi: "Bé đã xem xong", id: "Anak sudah membaca" },
  ruleKey: { zh: "特別注意", en: "Important", ja: "特に大切", ko: "특히 중요", th: "สำคัญมาก", vi: "Đặc biệt lưu ý", id: "Penting" },
  rulesTitle: { zh: "和貓咪的約定", en: "With the cats", ja: "猫との約束", ko: "고양이와의 약속", th: "ข้อตกลงกับแมว", vi: "Lời hứa với các bé mèo", id: "Janji dengan kucing" },
  rulesSub: { zh: "相處禮儀・安全規範", en: "Cat etiquette and safety", ja: "猫とのマナーと安全のために", ko: "고양이 예절과 안전 수칙", th: "มารยาทและความปลอดภัย", vi: "Phép lịch sự và an toàn", id: "Etika dan keselamatan" },
  rulesLead: {
    zh: "這裡是貓咪的家。牠們可以自己決定要不要互動，我們不保證每次都會被撒嬌。",
    en: "This is the cats' home. They decide whether to interact, so cuddles aren't guaranteed.",
    ja: "ここは猫たちのおうちです。触れ合うかどうかは猫が決めるので、毎回甘えてくれるとは限りません。",
    ko: "이곳은 고양이들의 집이에요. 교감할지는 고양이가 정하니, 매번 애교를 부리지는 않을 수 있어요.",
    th: "ที่นี่คือบ้านของแมว แมวจะเลือกเองว่าอยากเล่นด้วยหรือไม่ จึงไม่รับประกันว่าจะได้อ้อนทุกครั้ง",
    vi: "Đây là nhà của các bé mèo. Bé tự quyết định có muốn chơi hay không, nên không phải lúc nào cũng được làm nũng.",
    id: "Ini adalah rumah para kucing. Mereka yang memutuskan mau berinteraksi atau tidak, jadi tidak selalu bisa dimanja.",
  },
  childWithParent: {
    zh: "13 歲以下兒童入場，需家長全程在同一樓層陪同。",
    en: "Children under 13 must be accompanied by a parent on the same floor at all times.",
    ja: "13歳未満のお子様は、保護者の方が常に同じフロアで付き添ってください。",
    ko: "13세 미만 어린이는 보호자가 항상 같은 층에서 함께해야 해요.",
    th: "เด็กอายุต่ำกว่า 13 ปี ต้องมีผู้ปกครองอยู่ชั้นเดียวกันตลอดเวลา",
    vi: "Trẻ dưới 13 tuổi phải có phụ huynh đi cùng trên cùng một tầng trong suốt thời gian.",
    id: "Anak di bawah 13 tahun harus selalu didampingi orang tua di lantai yang sama.",
  },
  scratch: {
    zh: "如果被抓傷或咬傷，請馬上告訴店員。",
    en: "If you get scratched or bitten, tell our staff right away.",
    ja: "引っかかれたり噛まれたりしたら、すぐにスタッフへお知らせください。",
    ko: "긁히거나 물리면 바로 직원에게 알려 주세요.",
    th: "หากถูกข่วนหรือกัด กรุณาแจ้งพนักงานทันที",
    vi: "Nếu bị cào hoặc cắn, hãy báo ngay cho nhân viên.",
    id: "Jika tercakar atau tergigit, segera beri tahu staf.",
  },
  agree: {
    zh: "我已了解費用、付款方式（現金／LINE Pay）和以上約定",
    en: "I understand the prices, payment (cash / LINE Pay) and the rules above",
    ja: "料金・お支払い方法（現金／LINE Pay）と上記の約束を理解しました",
    ko: "요금, 결제 방법(현금 / LINE Pay), 위 약속을 이해했어요",
    th: "ฉันเข้าใจราคา วิธีชำระเงิน (เงินสด / LINE Pay) และข้อตกลงข้างต้นแล้ว",
    vi: "Tôi đã hiểu giá, cách thanh toán (tiền mặt / LINE Pay) và các lời hứa ở trên",
    id: "Saya memahami harga, cara bayar (tunai / LINE Pay), dan aturan di atas",
  },
  finish: { zh: "完成確認", en: "Confirm", ja: "確認する", ko: "확인 완료", th: "ยืนยัน", vi: "Xác nhận", id: "Konfirmasi" },
  sending: { zh: "送出中…", en: "Sending…", ja: "送信中…", ko: "전송 중…", th: "กำลังส่ง…", vi: "Đang gửi…", id: "Mengirim…" },

  doneTitle: { zh: "確認完成", en: "All set!", ja: "確認完了", ko: "확인 완료", th: "เรียบร้อยแล้ว!", vi: "Hoàn tất!", id: "Selesai!" },
  doneShow: {
    zh: "請把這個畫面給櫃檯店員看",
    en: "Please show this screen to our staff",
    ja: "この画面をスタッフにお見せください",
    ko: "이 화면을 직원에게 보여 주세요",
    th: "กรุณาแสดงหน้าจอนี้ให้พนักงานดู",
    vi: "Vui lòng đưa màn hình này cho nhân viên xem",
    id: "Tunjukkan layar ini kepada staf",
  },
  code: { zh: "確認碼", en: "Code", ja: "確認コード", ko: "확인 코드", th: "รหัสยืนยัน", vi: "Mã xác nhận", id: "Kode" },
  confirmedAt: { zh: "確認時間", en: "Confirmed", ja: "確認時刻", ko: "확인 시간", th: "เวลายืนยัน", vi: "Thời gian xác nhận", id: "Waktu konfirmasi" },
  restart: { zh: "下一組客人", en: "Next guests", ja: "次のお客様", ko: "다음 손님", th: "ลูกค้ากลุ่มถัดไป", vi: "Khách tiếp theo", id: "Tamu berikutnya" },
  again: { zh: "重新填寫（換下一組）", en: "Start over (next group)", ja: "最初からやり直す（次のグループ）", ko: "처음부터 다시 (다음 그룹)", th: "เริ่มใหม่ (กลุ่มถัดไป)", vi: "Làm lại (nhóm tiếp theo)", id: "Mulai lagi (grup berikutnya)" },

  fosterLink: {
    zh: "入座後，來認識正在等家的貓咪",
    en: "Once you're seated, meet the cats waiting for a home",
    ja: "お席に着いたら、おうちを待つ猫たちに会いに",
    ko: "자리에 앉으면, 가족을 기다리는 고양이들을 만나 보세요",
    th: "นั่งแล้ว มาทำความรู้จักแมวที่กำลังรอบ้าน",
    vi: "Ngồi xong rồi, hãy làm quen với các bé mèo đang chờ nhà",
    id: "Setelah duduk, kenali kucing yang sedang menunggu rumah",
  },
  fosterPageTitle: { zh: "今天在店裡等家的孩子", en: "Cats waiting for a home today", ja: "今日おうちを待っている子たち", ko: "오늘 가족을 기다리는 아이들", th: "แมวที่กำลังรอบ้านวันนี้", vi: "Các bé đang chờ nhà hôm nay", id: "Kucing yang menunggu rumah hari ini" },
  fosterLinkFufu: {
    zh: "入座後，來認識 FUFU 的貓咪",
    en: "Once you're seated, meet FUFU's cats",
    ja: "お席に着いたら、FUFUの猫たちに会いに",
    ko: "자리에 앉으면, FUFU의 고양이들을 만나 보세요",
    th: "นั่งแล้ว มาทำความรู้จักแมวของ FUFU",
    vi: "Ngồi xong rồi, hãy làm quen với các bé mèo của FUFU",
    id: "Setelah duduk, kenali kucing-kucing FUFU",
  },
  fosterPageTitleFufu: { zh: "認識 FUFU 的貓咪", en: "Meet FUFU's cats", ja: "FUFUの猫たち", ko: "FUFU의 고양이들", th: "รู้จักแมวของ FUFU", vi: "Làm quen mèo của FUFU", id: "Kenali kucing FUFU" },
  fufuAsk: {
    zh: "每隻貓咪個性不同，想摸摸前可以先問店員牠今天的心情。",
    en: "Every cat is different. Ask our staff how a cat is feeling today before you pet it.",
    ja: "猫それぞれ性格が違います。なでる前に、今日の様子をスタッフに聞いてみてください。",
    ko: "고양이마다 성격이 달라요. 쓰다듬기 전에 오늘 기분이 어떤지 직원에게 물어보세요.",
    th: "แมวแต่ละตัวนิสัยไม่เหมือนกัน ก่อนลูบ ลองถามพนักงานว่าวันนี้อารมณ์เป็นอย่างไร",
    vi: "Mỗi bé mèo một tính cách. Trước khi vuốt ve, hãy hỏi nhân viên tâm trạng của bé hôm nay.",
    id: "Setiap kucing berbeda. Sebelum mengelus, tanyakan ke staf bagaimana suasana hatinya hari ini.",
  },
  fosterAsk: {
    zh: "想多認識哪一隻，歡迎直接問店員。",
    en: "Want to know more about one of them? Just ask our staff.",
    ja: "気になる子がいたら、スタッフに気軽に聞いてください。",
    ko: "궁금한 아이가 있으면 직원에게 편하게 물어보세요.",
    th: "อยากรู้จักตัวไหนมากขึ้น ถามพนักงานได้เลย",
    vi: "Muốn biết thêm về bé nào, cứ hỏi nhân viên nhé.",
    id: "Ingin tahu lebih banyak tentang salah satunya? Tanyakan saja ke staf.",
  },
  fosterLead: {
    zh: "NUKUNUKU 是中途貓咖啡廳。今天遇見的孩子，有些正在找家人，點照片可以認識牠。",
    en: "NUKUNUKU is a foster-cat café. Some of the cats you'll meet today are looking for a family. Tap a photo to get to know them.",
    ja: "NUKUNUKUは保護猫カフェです。今日出会う猫の中には、家族を探している子もいます。写真をタップして知ってください。",
    ko: "NUKUNUKU는 보호묘 카페예요. 오늘 만날 아이 중에는 가족을 찾는 아이들도 있어요. 사진을 눌러 알아봐 주세요.",
    th: "NUKUNUKU เป็นคาเฟ่แมวพักพิง แมวบางตัวที่คุณพบวันนี้กำลังหาครอบครัวอยู่ แตะรูปเพื่อทำความรู้จัก",
    vi: "NUKUNUKU là quán cà phê mèo tạm nuôi. Một số bé bạn gặp hôm nay đang tìm gia đình. Chạm vào ảnh để làm quen.",
    id: "NUKUNUKU adalah kafe kucing asuh. Beberapa kucing yang Anda temui hari ini sedang mencari keluarga. Ketuk foto untuk mengenalnya.",
  },
  matching: { zh: "媒合中", en: "Matching", ja: "お見合い中", ko: "매칭 중", th: "กำลังจับคู่", vi: "Đang ghép đôi", id: "Dalam proses" },
  adoptHow: { zh: "認養流程與條件", en: "How adoption works", ja: "譲渡の流れと条件", ko: "입양 절차와 조건", th: "ขั้นตอนและเงื่อนไขการรับเลี้ยง", vi: "Quy trình và điều kiện nhận nuôi", id: "Cara dan syarat adopsi" },
  fosterLeadFufu: {
    zh: "FUFU 的貓咪都是店貓，會一直在這裡生活。點照片可以認識牠們的名字和個性。",
    en: "All of FUFU's cats live here for good. Tap a photo to learn their names and personalities.",
    ja: "FUFUの猫たちはずっとここで暮らす店猫です。写真をタップして名前と性格を知ってください。",
    ko: "FUFU의 고양이들은 이곳에서 계속 사는 매장 고양이예요. 사진을 눌러 이름과 성격을 알아보세요.",
    th: "แมวของ FUFU เป็นแมวประจำร้านที่อยู่ที่นี่ตลอดไป แตะรูปเพื่อดูชื่อและนิสัย",
    vi: "Các bé mèo của FUFU là mèo của quán, sống ở đây mãi mãi. Chạm vào ảnh để biết tên và tính cách.",
    id: "Semua kucing FUFU tinggal di sini selamanya. Ketuk foto untuk mengenal nama dan sifatnya.",
  },
  fullTitle: { zh: "目前客滿", en: "We're full right now", ja: "ただいま満席です", ko: "지금은 만석이에요", th: "ขณะนี้ที่นั่งเต็ม", vi: "Hiện quán đã kín chỗ", id: "Saat ini penuh" },
  fullLead: {
    zh: "很抱歉，店內目前已經客滿。您可以登記候位，有空位時我們會通知您；也可以前往同在西門町的 {other}。",
    en: "Sorry, we're full at the moment. You can join the waitlist and we'll let you know when a spot opens, or visit {other}, also in Ximending.",
    ja: "申し訳ありません、ただいま満席です。順番待ちに登録いただくと、空き次第お知らせします。同じ西門町の {other} もご利用いただけます。",
    ko: "죄송합니다. 지금은 만석이에요. 대기 등록을 하시면 자리가 나는 대로 알려드려요. 같은 시먼딩에 있는 {other}도 이용하실 수 있어요.",
    th: "ขออภัย ขณะนี้ที่นั่งเต็ม คุณสามารถลงชื่อรอคิว เราจะแจ้งเมื่อมีที่ว่าง หรือไปที่ {other} ซึ่งอยู่ในซีเหมินติงเช่นกัน",
    vi: "Xin lỗi, hiện quán đã kín chỗ. Bạn có thể đăng ký chờ, chúng tôi sẽ báo khi có chỗ; hoặc ghé {other}, cũng ở Tây Môn Đinh.",
    id: "Maaf, saat ini kami penuh. Anda bisa masuk daftar tunggu dan kami akan memberi tahu saat ada tempat, atau kunjungi {other} yang juga di Ximending.",
  },
  waitTitle: { zh: "登記候位", en: "Join the waitlist", ja: "順番待ちに登録", ko: "대기 등록", th: "ลงชื่อรอคิว", vi: "Đăng ký chờ", id: "Masuk daftar tunggu" },
  waitPhone: { zh: "聯絡電話", en: "Phone number", ja: "電話番号", ko: "전화번호", th: "เบอร์โทรศัพท์", vi: "Số điện thoại", id: "Nomor telepon" },
  waitPhoneHint: {
    zh: "台灣手機，或含國碼的號碼（例如 +81…）。電話只用來通知入座，入座或取消後立即刪除。",
    en: "A Taiwan mobile number or one with a country code (e.g. +1…). Used only to call you when it's your turn, and deleted once you're seated or cancel.",
    ja: "台湾の携帯番号、または国番号付きの番号（例：+81…）。ご案内の連絡のみに使い、ご案内後またはキャンセル後すぐに削除します。",
    ko: "대만 휴대폰 번호 또는 국가번호 포함 번호(예: +82…). 입장 안내 연락에만 쓰이며, 입장 또는 취소 후 바로 삭제돼요.",
    th: "เบอร์มือถือไต้หวัน หรือเบอร์ที่มีรหัสประเทศ (เช่น +66…) ใช้เพื่อแจ้งเมื่อถึงคิวเท่านั้น และจะลบทันทีเมื่อเข้านั่งหรือยกเลิก",
    vi: "Số di động Đài Loan hoặc số có mã quốc gia (vd: +84…). Chỉ dùng để gọi khi đến lượt, và sẽ xoá ngay khi bạn vào chỗ hoặc huỷ.",
    id: "Nomor ponsel Taiwan atau nomor dengan kode negara (mis. +62…). Hanya untuk menghubungi saat giliran Anda, dan langsung dihapus setelah duduk atau batal.",
  },
  waitSize: { zh: "人數", en: "Party size", ja: "人数", ko: "인원", th: "จำนวนคน", vi: "Số người", id: "Jumlah orang" },
  waitSubmit: { zh: "登記候位", en: "Join waitlist", ja: "登録する", ko: "대기 등록하기", th: "ลงชื่อรอคิว", vi: "Đăng ký", id: "Daftar" },
  waitBadPhone: { zh: "請輸入正確的電話號碼", en: "Please enter a valid phone number", ja: "正しい電話番号を入力してください", ko: "올바른 전화번호를 입력해 주세요", th: "กรุณากรอกเบอร์โทรให้ถูกต้อง", vi: "Vui lòng nhập số điện thoại hợp lệ", id: "Masukkan nomor telepon yang benar" },
  waitFail: { zh: "目前無法登記，請洽櫃檯店員", en: "Couldn't register. Please ask our staff.", ja: "登録できませんでした。スタッフにお声がけください。", ko: "등록할 수 없어요. 직원에게 문의해 주세요.", th: "ลงชื่อไม่สำเร็จ กรุณาติดต่อพนักงาน", vi: "Không đăng ký được. Vui lòng hỏi nhân viên.", id: "Gagal mendaftar. Silakan hubungi staf." },
  waitNo: { zh: "您的候位號碼", en: "Your waitlist number", ja: "あなたの順番待ち番号", ko: "대기 번호", th: "หมายเลขคิวของคุณ", vi: "Số thứ tự của bạn", id: "Nomor antrean Anda" },
  waitAhead: { zh: "前面還有 {n} 組", en: "{n} group(s) ahead of you", ja: "前に {n} 組お待ちです", ko: "앞에 {n}팀이 있어요", th: "มีอีก {n} กลุ่มก่อนคุณ", vi: "Còn {n} nhóm trước bạn", id: "{n} grup di depan Anda" },
  waitNext: { zh: "下一組就是您", en: "You're next", ja: "次があなたの番です", ko: "다음 차례예요", th: "คิวถัดไปคือคุณ", vi: "Đến lượt bạn tiếp theo", id: "Anda berikutnya" },
  waitCalled: { zh: "輪到您了！請回到櫃檯", en: "It's your turn! Please come to the counter.", ja: "お待たせしました！カウンターへお越しください", ko: "차례가 되었어요! 카운터로 와 주세요", th: "ถึงคิวคุณแล้ว! กรุณามาที่เคาน์เตอร์", vi: "Đến lượt bạn rồi! Vui lòng đến quầy.", id: "Giliran Anda! Silakan ke kasir." },
  waitKeep: {
    zh: "請保持這個頁面開啟，輪到您時這裡會顯示，我們也會打電話通知。",
    en: "Keep this page open. It will update when it's your turn, and we'll also call you.",
    ja: "このページを開いたままにしてください。順番が来るとここに表示され、お電話でもお知らせします。",
    ko: "이 페이지를 열어 두세요. 차례가 되면 여기에 표시되고 전화로도 알려드려요.",
    th: "กรุณาเปิดหน้านี้ค้างไว้ เมื่อถึงคิวจะแสดงที่นี่ และเราจะโทรแจ้งด้วย",
    vi: "Hãy giữ trang này mở. Khi đến lượt sẽ hiện ở đây, và chúng tôi cũng sẽ gọi điện.",
    id: "Biarkan halaman ini terbuka. Akan muncul di sini saat giliran Anda, dan kami juga akan menelepon.",
  },
  waitKeepKiosk: {
    zh: "請記下號碼，輪到您時我們會打電話通知。",
    en: "Please note your number. We'll call you when it's your turn.",
    ja: "番号をお控えください。順番が来たらお電話します。",
    ko: "번호를 기억해 주세요. 차례가 되면 전화드릴게요.",
    th: "กรุณาจดหมายเลขคิวไว้ เราจะโทรแจ้งเมื่อถึงคิว",
    vi: "Vui lòng ghi nhớ số của bạn. Chúng tôi sẽ gọi khi đến lượt.",
    id: "Catat nomor Anda. Kami akan menelepon saat giliran Anda.",
  },
  waitCancel: { zh: "取消候位", en: "Cancel", ja: "キャンセルする", ko: "대기 취소", th: "ยกเลิกคิว", vi: "Huỷ chờ", id: "Batalkan" },
  waitCancelled: { zh: "已取消候位，歡迎下次再來。", en: "Your spot has been cancelled. Hope to see you next time!", ja: "キャンセルしました。またのお越しをお待ちしています。", ko: "대기를 취소했어요. 다음에 또 만나요.", th: "ยกเลิกคิวแล้ว แล้วพบกันใหม่นะคะ", vi: "Đã huỷ chờ. Hẹn gặp lại bạn lần sau!", id: "Antrean dibatalkan. Sampai jumpa lagi!" },
  waitSeated: { zh: "已入座，祝您和貓咪度過愉快的時光！", en: "You're seated. Enjoy your time with the cats!", ja: "ご案内済みです。猫たちとの時間をお楽しみください！", ko: "입장 완료! 고양이들과 즐거운 시간 보내세요!", th: "เข้านั่งแล้ว ขอให้สนุกกับแมวๆ นะคะ!", vi: "Đã vào chỗ. Chúc bạn vui vẻ cùng các bé mèo!", id: "Sudah duduk. Selamat bersenang-senang dengan para kucing!" },
  waitRead: { zh: "等候時先看入場說明 ›", en: "Read the entry guide while you wait ›", ja: "待ち時間に入場案内を読む ›", ko: "기다리는 동안 입장 안내 보기 ›", th: "อ่านข้อมูลการเข้าร้านระหว่างรอ ›", vi: "Đọc hướng dẫn vào cửa trong lúc chờ ›", id: "Baca info masuk sambil menunggu ›" },
  waitSkip: { zh: "店員已請我入場，開始入場確認 ›", en: "Staff said I can come in — start check-in ›", ja: "スタッフに案内されました・入場確認へ ›", ko: "직원 안내를 받았어요 — 입장 확인 시작 ›", th: "พนักงานเรียกแล้ว — เริ่มยืนยันการเข้าร้าน ›", vi: "Nhân viên đã mời vào — bắt đầu xác nhận ›", id: "Staf sudah memanggil — mulai check-in ›" },
  otherTitle: { zh: "前往 {other}", en: "Visit {other}", ja: "{other} へ行く", ko: "{other}로 가기", th: "ไปที่ {other}", vi: "Đến {other}", id: "Ke {other}" },
  otherOpen: { zh: "目前可入場", en: "Seats available now", ja: "ただいま入場できます", ko: "지금 입장 가능해요", th: "ตอนนี้มีที่ว่าง", vi: "Hiện còn chỗ", id: "Ada tempat sekarang" },
  otherFull: { zh: "也客滿中・候位 {n} 組", en: "Also full · {n} waiting", ja: "こちらも満席・{n} 組待ち", ko: "여기도 만석 · 대기 {n}팀", th: "เต็มเช่นกัน · รอ {n} กลุ่ม", vi: "Cũng kín chỗ · {n} nhóm chờ", id: "Juga penuh · {n} menunggu" },
  otherMap: { zh: "Google 地圖導航", en: "Open in Google Maps", ja: "Googleマップで開く", ko: "구글 지도로 열기", th: "เปิดใน Google Maps", vi: "Mở Google Maps", id: "Buka di Google Maps" },
} satisfies Record<string, L10n | Record<Lang, string[]>>;

/** 取文字並代入 {變數} */
export function tr(entry: L10n, lang: Lang, vars: Record<string, string | number> = {}) {
  return (entry[lang] || entry.en || entry.zh).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

/** 依停留分鐘數計算每人費用（10 分鐘四捨五入、上限 100 分鐘） */
export function perPerson(minutes: number, per10 = PRICE_PER_10) {
  const blocks = Math.min(PRICE_CAP_MIN / 10, Math.max(1, Math.round(minutes / 10)));
  return blocks * per10;
}
