import { Fragment, type ReactNode } from "react";

/**
 * 後台「純文字」欄位的排版：
 * - 空一行（或連續兩個空格）＝新段落
 * - 換行（或連續四個以上空格）＝段落內換行
 * - **粗體**
 */
function inline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function paragraphs(text: string): string[][] {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/[  ]{4,}/g, "\n")
    .replace(/[  ]{2,3}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n");
  return normalized
    .split(/\n{2,}/)
    .map((p) => p.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);
}

export function PlainText({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;
  const paras = paragraphs(text);
  if (paras.length === 1 && paras[0].length === 1) return <span className={className}>{inline(paras[0][0])}</span>;
  return (
    <span className={["plain-text", className].filter(Boolean).join(" ")}>
      {paras.map((lines, i) => (
        <span key={i} className="plain-p">
          {lines.map((l, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {inline(l)}
            </Fragment>
          ))}
        </span>
      ))}
    </span>
  );
}
