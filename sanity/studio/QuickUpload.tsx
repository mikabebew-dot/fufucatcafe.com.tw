/**
 * 後台「手機上傳」：用手機也能輕鬆上傳照片。
 * 大按鈕、一次一步：選放在哪裡 → 選照片（相簿或直接拍照）→ 寫一句描述 → 送出。
 * 用的是登入後台的身分，只有管理員能使用。
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useClient } from "sanity";

type Mode = "append" | "replace" | "cat";
type Target = { id: string; label: string; hint: string; doc?: string; field?: string; mode: Mode; slide?: boolean };

const TARGETS: Target[] = [
  { id: "home-hero", label: "首頁主視覺", hint: "加一張到首頁輪播", doc: "homePage", field: "heroSlides", mode: "append", slide: true },
  { id: "fufu-hero", label: "FUFU 主照片", hint: "換掉 FUFU 品牌頁最上面的照片", doc: "brand-fufu", field: "hero", mode: "replace" },
  { id: "nuku-hero", label: "NUKUNUKU 主照片", hint: "換掉 NUKUNUKU 品牌頁最上面的照片", doc: "brand-nukunuku", field: "hero", mode: "replace" },
  { id: "fufu-space", label: "FUFU 店內空間", hint: "加一張到 FUFU 空間相簿", doc: "brand-fufu", field: "space", mode: "append" },
  { id: "nuku-space", label: "NUKUNUKU 店內空間", hint: "加一張到 NUKUNUKU 空間相簿", doc: "brand-nukunuku", field: "space", mode: "append" },
  { id: "fufu-story", label: "FUFU 理念照片", hint: "換掉 FUFU 理念段落的照片", doc: "brand-fufu", field: "storyImage", mode: "replace" },
  { id: "nuku-story", label: "NUKUNUKU 理念照片", hint: "換掉 NUKUNUKU 理念段落的照片", doc: "brand-nukunuku", field: "storyImage", mode: "replace" },
  { id: "cat", label: "貓咪照片", hint: "放到某一隻貓的頁面", mode: "cat" },
];

type CatRow = { _id: string; name?: string; brand?: string };

const key = () => Math.random().toString(36).slice(2, 12);
const baseId = (id: string) => id.replace(/^drafts\./, "");

const C = {
  ink: "#3e3b3a",
  muted: "#6f6a66",
  line: "#e4e0db",
  soft: "#f1efec",
  green: "#4f7a72",
  ground: "#faf9f7",
};
const s: Record<string, CSSProperties> = {
  page: { minHeight: "100%", background: C.ground, color: C.ink, padding: "20px 16px 48px", boxSizing: "border-box", overflowY: "auto", height: "100%" },
  wrap: { maxWidth: 560, margin: "0 auto", display: "grid", gap: 20 },
  h1: { fontSize: 22, fontWeight: 700, margin: 0 },
  step: { fontSize: 13, fontWeight: 700, color: C.green, letterSpacing: ".04em", margin: "0 0 8px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 },
  choice: { textAlign: "left", padding: "14px 14px", borderRadius: 16, border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, font: "inherit", cursor: "pointer", minHeight: 72 },
  choiceOn: { borderColor: C.green, background: "#e2efec", boxShadow: `inset 0 0 0 1px ${C.green}` },
  choiceTitle: { display: "block", fontSize: 16, fontWeight: 700 },
  choiceHint: { display: "block", fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.4 },
  bigBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 56, borderRadius: 999, border: 0, background: C.green, color: "#fff", font: "inherit", fontSize: 17, fontWeight: 700, cursor: "pointer" },
  ghostBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 52, borderRadius: 999, border: `1.5px solid ${C.line}`, background: "#fff", color: C.ink, font: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer" },
  input: { width: "100%", boxSizing: "border-box", minHeight: 52, borderRadius: 14, border: `1.5px solid ${C.line}`, padding: "0 14px", font: "inherit", fontSize: 16, background: "#fff", color: C.ink },
  card: { background: "#fff", borderRadius: 20, padding: 16, border: `1px solid ${C.line}`, display: "grid", gap: 12 },
  preview: { width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 14, display: "block" },
  note: { fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: 0 },
  ok: { background: "#e3f0e5", color: "#2e6b3f", borderRadius: 14, padding: "14px 16px", fontSize: 15, lineHeight: 1.6 },
  warn: { background: "#fbecd8", color: "#8a5a12", borderRadius: 14, padding: "14px 16px", fontSize: 15, lineHeight: 1.6 },
  err: { background: "#f9e1dc", color: "#7e3c26", borderRadius: 14, padding: "14px 16px", fontSize: 15, lineHeight: 1.6 },
};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <p style={s.step}>步驟 {n}・{title}</p>
      {children}
    </section>
  );
}

export function QuickUpload() {
  const client = useClient({ apiVersion: "2025-07-01" });
  const [target, setTarget] = useState<Target | null>(null);
  const [cats, setCats] = useState<CatRow[]>([]);
  const [catId, setCatId] = useState<string>("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatBrand, setNewCatBrand] = useState<"fufu" | "nukunuku">("nukunuku");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    if (target?.mode !== "cat") return;
    client
      .fetch<CatRow[]>(`*[_type == "cat"]{ _id, "name": name.zh, brand } | order(name asc)`, {}, { perspective: "raw" })
      .then((rows) => {
        const seen = new Map<string, CatRow>();
        for (const r of rows) {
          const id = baseId(r._id);
          if (!seen.has(id) || r._id.startsWith("drafts.")) seen.set(id, { ...r, _id: id });
        }
        setCats([...seen.values()].sort((a, b) => (a.name || "").localeCompare(b.name || "", "zh-Hant")));
      })
      .catch(() => setCats([]));
  }, [client, target]);

  const reset = () => {
    setFile(null);
    setAlt("");
    setResult(null);
  };

  /** 有草稿就改草稿（不影響正式網站），沒有草稿就直接更新正式網站 */
  async function applyPatch(docId: string, build: (p: ReturnType<typeof client.patch>, current: Record<string, unknown> | null) => ReturnType<typeof client.patch>) {
    const draft = await client.getDocument(`drafts.${docId}`);
    if (draft) {
      await build(client.patch(`drafts.${docId}`), draft).commit();
      return "draft" as const;
    }
    const published = await client.getDocument(docId);
    if (!published) throw new Error("找不到這個頁面，請先在「編輯內容」建立。");
    await build(client.patch(docId), published).commit();
    return "live" as const;
  }

  async function submit() {
    if (!target || !file) return;
    setBusy(true);
    setResult(null);
    try {
      const asset = await client.assets.upload("image", file, { filename: file.name });
      const image = {
        _type: "imageWithAlt",
        asset: { _type: "reference", _ref: asset._id },
        ...(alt.trim() ? { alt: { _type: "l10nString", zh: alt.trim() } } : {}),
      };

      let where: "draft" | "live" = "live";
      let label = target.label;

      if (target.mode === "cat") {
        if (catId === "__new") {
          const name = newCatName.trim();
          if (!name) throw new Error("請輸入新貓咪的名字。");
          await client.create({
            _id: `drafts.${crypto.randomUUID()}`,
            _type: "cat",
            brand: newCatBrand,
            status: "resident",
            name: { _type: "l10nString", zh: name },
            cover: image,
          });
          setResult({ kind: "warn", text: `已新增貓咪「${name}」並放上照片，目前是草稿。請到「編輯內容 → ${newCatBrand === "fufu" ? "FUFU" : "NUKUNUKU"} → 貓咪」補上網址代稱等資料後按「發布」。` });
          reset();
          setNewCatName("");
          return;
        }
        if (!catId) throw new Error("請先選擇是哪一隻貓。");
        const cat = cats.find((c) => c._id === catId);
        label = `貓咪「${cat?.name ?? ""}」`;
        where = await applyPatch(catId, (p, current) =>
          current && (current as { cover?: { asset?: unknown } }).cover?.asset
            ? p.setIfMissing({ photos: [] }).append("photos", [{ ...image, _key: key() }])
            : p.set({ cover: image }),
        );
      } else if (target.doc && target.field) {
        const field = target.field;
        if (target.mode === "replace") {
          where = await applyPatch(target.doc, (p) => p.set({ [field]: image }));
        } else {
          const item = target.slide
            ? { _type: "heroSlide", _key: key(), hidden: false, image }
            : { ...image, _key: key() };
          where = await applyPatch(target.doc, (p) => p.setIfMissing({ [field]: [] }).append(field, [item]));
        }
      }

      setResult(
        where === "live"
          ? { kind: "ok", text: `✅ 已上傳到「${label}」，網站約 1 分鐘內更新。` }
          : { kind: "warn", text: `已上傳到「${label}」的草稿。這一頁還有其他尚未發布的修改，請到「編輯內容」打開這一頁檢查後按「發布」。` },
      );
      reset();
    } catch (e) {
      setResult({ kind: "err", text: `上傳失敗：${e instanceof Error ? e.message : "請稍後再試"}` });
    } finally {
      setBusy(false);
    }
  }

  const ready = !!target && !!file && (target.mode !== "cat" || (catId && (catId !== "__new" || newCatName.trim())));

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div>
          <h1 style={s.h1}>手機上傳照片</h1>
          <p style={{ ...s.note, marginTop: 6 }}>選好位置和照片，按「上傳」就完成。原圖直接上傳即可，網站會自動縮小、轉檔。</p>
        </div>

        {result && <div style={s[result.kind]}>{result.text}</div>}

        <Step n={1} title="要放在哪裡？">
          <div style={s.grid}>
            {TARGETS.map((t) => (
              <button
                key={t.id}
                type="button"
                style={{ ...s.choice, ...(target?.id === t.id ? s.choiceOn : null) }}
                onClick={() => { setTarget(t); setResult(null); }}
                aria-pressed={target?.id === t.id}
              >
                <span style={s.choiceTitle}>{t.label}</span>
                <span style={s.choiceHint}>{t.hint}</span>
              </button>
            ))}
          </div>
        </Step>

        {target?.mode === "cat" && (
          <Step n={2} title="哪一隻貓？">
            <div style={{ display: "grid", gap: 10 }}>
              <select style={s.input} value={catId} onChange={(e) => setCatId(e.target.value)}>
                <option value="">請選擇…</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name || "（未命名）"}・{c.brand === "fufu" ? "FUFU" : "NUKUNUKU"}
                  </option>
                ))}
                <option value="__new">＋ 新增一隻貓</option>
              </select>
              {catId === "__new" && (
                <div style={s.card}>
                  <input style={s.input} placeholder="貓咪的名字" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                  <div style={s.grid}>
                    {(["fufu", "nukunuku"] as const).map((b) => (
                      <button key={b} type="button" style={{ ...s.choice, minHeight: 52, ...(newCatBrand === b ? s.choiceOn : null) }} onClick={() => setNewCatBrand(b)}>
                        <span style={s.choiceTitle}>{b === "fufu" ? "FUFU" : "NUKUNUKU"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p style={s.note}>這隻貓還沒有代表照片的話，會設成代表照片；已經有的話，會加到「更多照片」。</p>
            </div>
          </Step>
        )}

        {target && (
          <Step n={target.mode === "cat" ? 3 : 2} title="選照片">
            <div style={{ display: "grid", gap: 10 }}>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" style={s.preview} />
              )}
              <label style={s.ghostBtn}>
                {file ? "換一張照片" : "📷 從相簿選擇或拍照"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }}
                />
              </label>
            </div>
          </Step>
        )}

        {target && file && (
          <Step n={target.mode === "cat" ? 4 : 3} title="一句話描述（選填）">
            <input
              style={s.input}
              placeholder="例如：灰色貓咪在窗邊睡覺"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
            <p style={{ ...s.note, marginTop: 6 }}>給 Google 和視障朋友看的，可以不填。</p>
          </Step>
        )}

        {target && (
          <button type="button" style={{ ...s.bigBtn, opacity: ready && !busy ? 1 : 0.45 }} disabled={!ready || busy} onClick={submit}>
            {busy ? "上傳中…" : "上傳"}
          </button>
        )}

        <p style={s.note}>要調整照片的裁切、排序或刪除，請到上方「編輯內容」打開該頁操作（電腦比較好拖曳）。</p>
      </div>
    </div>
  );
}
