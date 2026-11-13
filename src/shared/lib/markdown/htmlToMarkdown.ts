import { SITE_URL } from "../site";

/**
 * Small HTML → Markdown converter for the HTML the API sends (post bodies and CMS rich text,
 * already sanitized there). Covers headings, paragraphs, links, images, emphasis, code, lists,
 * blockquotes, tables and rules. Nested lists are flattened to one level — good enough for
 * agents reading the text, not meant as a round-trip converter.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity: string, code: string) => {
      if (code.startsWith("#x") || code.startsWith("#X")) {
        return String.fromCodePoint(parseInt(code.slice(2), 16));
      }
      if (code.startsWith("#")) {
        return String.fromCodePoint(parseInt(code.slice(1), 10));
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
    },
  );
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** Value of `name="…"` (or single-quoted) in a tag's attribute string. */
function readAttribute(attributes: string, name: string): string | null {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i").exec(
    attributes,
  );
  if (!match) return null;
  return decodeEntities(match[2] ?? match[3] ?? "");
}

/** Site-relative links become absolute, so the Markdown works outside the page. */
function absoluteHref(href: string): string {
  if (href.startsWith("/") && !href.startsWith("//")) return `${SITE_URL}${href}`;
  return href;
}

/** Text of an inline element on one line (Markdown link labels and table cells can't wrap). */
function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function convertTable(tableHtml: string): string {
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (row) =>
      [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
        oneLine(decodeEntities(stripTags(cell[1]))).replace(/\|/g, "\\|"),
      ),
  );
  if (rows.length === 0) return "";
  const columnCount = Math.max(...rows.map((cells) => cells.length));
  const formatRow = (cells: string[]) =>
    `| ${Array.from({ length: columnCount }, (_, index) => cells[index] ?? "").join(" | ")} |`;
  const [header, ...body] = rows;
  const separator = `| ${Array.from({ length: columnCount }, () => "---").join(" | ")} |`;
  return `\n\n${[formatRow(header), separator, ...body.map(formatRow)].join("\n")}\n\n`;
}

/**
 * @param minHeadingLevel Headings are pushed down to at least this level (the Markdown document
 *   already has its own `#` title, so body headings start at `##` by default).
 */
export function htmlToMarkdown(html: string, minHeadingLevel = 2): string {
  // Code is set aside first so the conversions below never touch its contents
  const codeBlocks: string[] = [];
  const keep = (markdown: string): string => {
    codeBlocks.push(markdown);
    return `\u0000${codeBlocks.length - 1}\u0000`;
  };

  let markdown = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_match, inner: string) => {
      const language = /class="[^"]*language-([\w-]+)/i.exec(inner)?.[1] ?? "";
      const code = decodeEntities(stripTags(inner)).replace(/\n+$/, "");
      return keep(`\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`);
    })
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, inner: string) =>
      keep(`\`${decodeEntities(stripTags(inner))}\``),
    )
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (table) => keep(convertTable(table)))
    .replace(
      /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
      (_match, inner: string) => {
        const quoted = htmlToMarkdown(inner, minHeadingLevel)
          .split("\n")
          .map((line) => (line ? `> ${line}` : ">"))
          .join("\n");
        return keep(`\n\n${quoted}\n\n`);
      },
    )
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level: string, inner: string) => {
      const depth = Math.min(6, Math.max(minHeadingLevel, Number(level)));
      return `\n\n${"#".repeat(depth)} ${oneLine(stripTags(inner))}\n\n`;
    })
    .replace(/<img([^>]*)>/gi, (_match, attributes: string) => {
      const src = readAttribute(attributes, "src");
      if (!src) return "";
      const alt = readAttribute(attributes, "alt") ?? "";
      return `![${oneLine(alt)}](${absoluteHref(src)})`;
    })
    .replace(/<a([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attributes: string, inner: string) => {
      const href = readAttribute(attributes, "href");
      const label = oneLine(stripTags(inner));
      if (!href) return label;
      return `[${label || href}](${absoluteHref(href)})`;
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, inner: string) =>
      inner.trim() ? `**${inner.trim()}**` : "",
    )
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, inner: string) =>
      inner.trim() ? `*${inner.trim()}*` : "",
    )
    .replace(/<br\s*\/?>/gi, "  \n")
    .replace(/<hr\s*\/?>/gi, "\n\n---\n\n")
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, inner: string) =>
      inner.replace(/<li[^>]*>/gi, "\n1. "),
    )
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(ul|ol)>/gi, "\n\n")
    .replace(/<\/(p|div|section|article|header|footer|figure|figcaption)>/gi, "\n\n");

  markdown = decodeEntities(stripTags(markdown))
    // Lines inside paragraphs/list items: drop the source indentation and stray line breaks
    .replace(/\n[ \t]+/g, "\n")
    .replace(/(\n- |\n1\. )\s+/g, "$1")
    .replace(/\u0000(\d+)\u0000/g, (_match, index: string) => codeBlocks[Number(index)]);

  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * CMS short texts may carry the editor markup `<accent>`, `<strong>` and `<br>`
 * (see shared/cms/Markup): bold stays bold, the rest becomes plain text.
 */
export function markupToMarkdown(text: string): string {
  return decodeEntities(
    text
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}
