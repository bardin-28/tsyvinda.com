import { LOCALE_LABELS, type Locale } from "@/i18n/locales";

import { EMAIL, SOCIAL_LINKS } from "./site";

/** One linked entry of an llms.txt section. */
export type LlmsLink = {
  title: string;
  url: string;
  description?: string | null;
};

/** Pages and posts of one language version of the site. */
export type LlmsLocaleSection = {
  locale: Locale;
  pages: LlmsLink[];
  posts: LlmsLink[];
};

export type LlmsTxtInput = {
  name: string;
  summary: string;
  details: string;
  /** First entry is the default language; the rest are listed as translations. */
  sections: LlmsLocaleSection[];
  /** Secondary links (legal, sitemap) for the llms.txt "Optional" section. */
  optional: LlmsLink[];
};

/** Single-line text safe inside a Markdown link label / list item. */
function inline(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/([[\]])/g, "\\$1")
    .trim();
}

function linkLine({ title, url, description }: LlmsLink): string {
  const line = `- [${inline(title)}](${url})`;
  return description ? `${line}: ${inline(description)}` : line;
}

function linkList(links: LlmsLink[]): string {
  return links.map(linkLine).join("\n");
}

/**
 * `/llms.txt` (https://llmstxt.org): a Markdown map of the site for language models —
 * H1 name, blockquote summary, then link sections per language (pages, then blog posts).
 */
export function buildLlmsTxt(input: LlmsTxtInput): string {
  const [primary, ...translations] = input.sections;
  const blocks: string[] = [
    `# ${input.name}`,
    `> ${inline(input.summary)}`,
    input.details,
    [
      "## Profiles",
      linkList([
        { title: "LinkedIn", url: SOCIAL_LINKS.linkedin },
        { title: "Telegram", url: SOCIAL_LINKS.telegram },
        { title: "Email", url: SOCIAL_LINKS.email, description: EMAIL },
      ]),
    ].join("\n\n"),
  ];

  if (primary) {
    blocks.push(`## Pages\n\n${linkList(primary.pages)}`);
    if (primary.posts.length > 0) {
      blocks.push(`## Blog posts\n\n${linkList(primary.posts)}`);
    }
  }

  for (const section of translations) {
    const label = LOCALE_LABELS[section.locale].name;
    blocks.push(
      `## ${label} (${section.locale})\n\n${linkList([...section.pages, ...section.posts])}`,
    );
  }

  if (input.optional.length > 0) {
    blocks.push(`## Optional\n\n${linkList(input.optional)}`);
  }

  return `${blocks.join("\n\n")}\n`;
}
