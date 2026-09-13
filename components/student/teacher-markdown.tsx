"use client";

import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import { sanitizeTeacherDisplay } from "@/convex/lib/teacherSpeech";

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-100">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0 marker:text-cyan-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0 marker:text-cyan-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <p className="mb-2 font-semibold text-white last:mb-0">{children}</p>,
  h2: ({ children }) => <p className="mb-2 font-semibold text-white last:mb-0">{children}</p>,
  h3: ({ children }) => <p className="mb-1.5 font-semibold text-white last:mb-0">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-cyan-400/40 pl-3 text-slate-300 last:mb-0">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const block = Boolean(className) || (typeof children === "string" && children.includes("\n"));
    if (block) {
      return <code className="font-mono text-[0.85em] text-cyan-100">{children}</code>;
    }
    return (
      <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[0.85em] text-cyan-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-black/40 p-2 font-mono text-xs text-slate-100 last:mb-0">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-300 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  img: () => null,
};

/** Models often put `- item` mid-paragraph; CommonMark only lists at line start. */
export function normalizeTeacherMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([.:;!?])\s+-\s+/g, "$1\n\n- ")
    .replace(/\s+-\s+(?=\*\*|[A-Z0-9])/g, "\n- ")
    .replace(/([.:;!?])\s+(\d+)\.\s+/g, "$1\n\n$2. ");
}

function TeacherFrac({ n, d }: { n: string; d: string }) {
  return (
    <span className="teacher-frac" aria-label={`${n} over ${d}`}>
      <span className="teacher-frac-num" aria-hidden="true">
        {n}
      </span>
      <span className="teacher-frac-den" aria-hidden="true">
        {d}
      </span>
    </span>
  );
}

function markFractions(text: string): { body: string; fracs: Array<{ n: string; d: string }> } {
  const fracs: Array<{ n: string; d: string }> = [];
  const body = text.replace(/\b(\d{1,3})\s*\/\s*(\d{1,3})\b/g, (_m, n: string, d: string) => {
    const idx = fracs.length;
    fracs.push({ n, d });
    return `%%F${idx}%%`;
  });
  return { body, fracs };
}

function renderFracs(text: string, fracs: Array<{ n: string; d: string }>): ReactNode[] {
  return text.split(/(%%F\d+%%)/g).map((piece, index) => {
    const match = piece.match(/^%%F(\d+)%%$/);
    if (match) {
      const frac = fracs[Number(match[1])];
      if (!frac) return null;
      return <TeacherFrac key={index} n={frac.n} d={frac.d} />;
    }
    return piece ? <span key={index}>{piece}</span> : null;
  });
}

function InlineRich({
  text,
  fracs,
}: {
  text: string;
  fracs: Array<{ n: string; d: string }>;
}) {
  return text.split(/(\*\*[^*]*\*\*)/g).map((part, index) => {
    const bold = part.match(/^\*\*([^*]*)\*\*$/);
    if (bold) {
      return (
        <strong key={index} className="font-semibold text-white">
          {renderFracs(bold[1] ?? "", fracs)}
        </strong>
      );
    }
    return <span key={index}>{renderFracs(part, fracs)}</span>;
  });
}

function TeacherBlock({
  block,
  fracs,
}: {
  block: string;
  fracs: Array<{ n: string; d: string }>;
}) {
  const lines = block.split("\n");
  const list = lines.every(
    (line) => !line.trim() || /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line),
  );
  if (list && lines.some((line) => line.trim())) {
    const ordered = lines.some((line) => /^\d+\.\s+/.test(line));
    const ListTag = ordered ? "ol" : "ul";
    const listClass = ordered
      ? "mb-2 list-decimal space-y-1 pl-4 last:mb-0 marker:text-cyan-300"
      : "mb-2 list-disc space-y-1 pl-4 last:mb-0 marker:text-cyan-300";
    return (
      <ListTag className={listClass}>
        {lines
          .filter((line) => line.trim())
          .map((line, index) => (
            <li key={index} className="leading-relaxed">
              <InlineRich
                text={line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")}
                fracs={fracs}
              />
            </li>
          ))}
      </ListTag>
    );
  }
  return (
    <p className="mb-2 last:mb-0 leading-relaxed">
      <InlineRich text={block} fracs={fracs} />
    </p>
  );
}

export function TeacherMarkdown({ text }: { text: string }) {
  const prepared = markFractions(normalizeTeacherMarkdown(sanitizeTeacherDisplay(text)));
  if (prepared.fracs.length === 0) {
    return <Markdown components={components}>{prepared.body}</Markdown>;
  }
  const blocks = prepared.body.split(/\n{2,}/);
  return (
    <div>
      {blocks.map((block, index) => (
        <TeacherBlock key={index} block={block} fracs={prepared.fracs} />
      ))}
    </div>
  );
}
