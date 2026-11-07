"use client";

import React, { useMemo } from "react";

// Renders the in-portal guide, written in a small subset of Markdown:
// # / ## / ### headings, paragraphs, - and 1. lists (two-space nesting),
// | tables |, **bold** and `code`. Kept dependency-free on purpose.

const slug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/\*\*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function Inline({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1)
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function parse(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m) items.push({ depth: Math.floor(m[1].length / 2), ordered: /\d/.test(m[2]), text: m[3] });
        else if (items.length) items[items.length - 1].text += " " + lines[i].trim();
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\s*([-*]|\d+\.)\s|\s*\|)/.test(lines[i])) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function List({ items, depth = 0 }) {
  const out = [];
  let k = 0;
  while (k < items.length) {
    const item = items[k];
    const children = [];
    k++;
    while (k < items.length && items[k].depth > item.depth) children.push(items[k++]);
    out.push({ item, children });
  }
  const ordered = out[0]?.item.ordered;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1 ${depth ? "mt-1" : ""}`}>
      {out.map(({ item, children }, idx) => (
        <li key={idx}>
          <Inline text={item.text} />
          {children.length > 0 && <List items={children} depth={depth + 1} />}
        </li>
      ))}
    </Tag>
  );
}

export default function GuideView({ markdown }) {
  const blocks = useMemo(() => parse(markdown), [markdown]);
  const sections = blocks.filter((b) => b.type === "h" && b.level === 2);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
      <nav className="hidden lg:block">
        <div className="sticky top-20 space-y-1 text-sm">
          <p className="font-semibold text-slate-900 mb-2">On this page</p>
          {sections.map((s) => (
            <a key={s.text} href={`#${slug(s.text)}`} className="block text-slate-600 hover:text-[var(--primary)]">
              {s.text}
            </a>
          ))}
        </div>
      </nav>
      <article className="space-y-4 text-sm leading-relaxed text-slate-700 min-w-0">
        {blocks.map((b, idx) => {
          if (b.type === "h") {
            if (b.level === 1)
              return (
                <h1 key={idx} className="text-2xl font-bold text-slate-900">
                  {b.text}
                </h1>
              );
            if (b.level === 2)
              return (
                <h2 key={idx} id={slug(b.text)} className="scroll-mt-20 pt-4 text-lg font-semibold text-slate-900 border-b pb-1">
                  {b.text}
                </h2>
              );
            return (
              <h3 key={idx} id={slug(b.text)} className="scroll-mt-20 pt-2 font-semibold text-slate-900">
                {b.text}
              </h3>
            );
          }
          if (b.type === "list") return <List key={idx} items={b.items} />;
          if (b.type === "table")
            return (
              <div key={idx} className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {b.rows[0].map((c, j) => (
                        <th key={j} className="px-3 py-2 font-semibold text-slate-900">
                          <Inline text={c} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {b.rows.slice(1).map((row, r) => (
                      <tr key={r}>
                        {row.map((c, j) => (
                          <td key={j} className="px-3 py-2 align-top">
                            <Inline text={c} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          return (
            <p key={idx}>
              <Inline text={b.text} />
            </p>
          );
        })}
      </article>
    </div>
  );
}
