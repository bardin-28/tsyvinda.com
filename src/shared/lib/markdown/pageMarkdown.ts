import { postDate, type Post } from "@/api/posts";
import type {
  Block,
  PageLink,
  Recommendation,
  Role,
  WebsitePage,
} from "@/shared/cms/schemas";

import { EMAIL, SOCIAL_LINKS } from "../site";
import { htmlToMarkdown, markupToMarkdown } from "./htmlToMarkdown";

/** A link line for lists of posts and pages. */
export type MarkdownLink = {
  title: string;
  url: string;
  description?: string | null;
};

/** Data a page's Markdown needs beyond the page itself. */
export type PageMarkdownContext = {
  /** Absolute URL of the page */
  url: string;
  /** Absolute URL of a page path in the page's language (for CMS links) */
  resolveUrl: (path: string) => string;
  /** Newest posts, listed by the blog feed */
  posts: MarkdownLink[];
};

const text = markupToMarkdown;

function paragraph(value: string | null | undefined): string | null {
  const content = value ? text(value) : "";
  return content || null;
}

function heading(value: string, level = 2): string | null {
  const content = text(value);
  return content ? `${"#".repeat(level)} ${content}` : null;
}

function bulletList(items: string[]): string | null {
  const lines = items.map(text).filter(Boolean);
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join("\n") : null;
}

export function linkList(links: MarkdownLink[]): string | null {
  if (links.length === 0) return null;
  return links
    .map(({ title, url, description }) => {
      const line = `- [${text(title).replace(/([[\]])/g, "\\$1")}](${url})`;
      return description ? `${line}: ${text(description)}` : line;
    })
    .join("\n");
}

function pageLink(
  label: string,
  link: PageLink,
  context: PageMarkdownContext,
): string | null {
  if (!link?.path || !text(label)) return null;
  return `[${text(label)}](${context.resolveUrl(link.path)})`;
}

function roleMarkdown(role: Role): string {
  const details = [role.period, role.location, role.type]
    .map(text)
    .filter(Boolean)
    .join(" · ");
  return [
    heading(`${role.title} — ${role.org}`, 3),
    details || null,
    bulletList(role.bullets),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function recommendationMarkdown(recommendation: Recommendation): string {
  const quote = recommendation.quote
    .map(text)
    .filter(Boolean)
    .map((line) => `> ${line}`)
    .join("\n>\n");
  const author = [recommendation.name, recommendation.role, recommendation.relation]
    .map(text)
    .filter(Boolean)
    .join(", ");
  return `${quote}\n\n— ${author}`;
}

function contactChannels(): string {
  return [
    `- Email: [${EMAIL}](${SOCIAL_LINKS.email})`,
    `- LinkedIn: ${SOCIAL_LINKS.linkedin}`,
    `- Telegram: ${SOCIAL_LINKS.telegram}`,
  ].join("\n");
}

/** Markdown parts of one CMS section, in reading order (empty parts are dropped). */
function blockParts(block: Block, context: PageMarkdownContext): (string | null)[] {
  switch (block.type) {
    case "homeHero": {
      const { data } = block;
      return [
        paragraph(`${data.rolePrimary} ${data.roleSecondary}`),
        pageLink(data.aboutLabel, data.aboutLink, context),
        pageLink(data.contactLabel, data.contactLink, context),
      ];
    }
    case "homeAbout":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        paragraph(block.data.lead),
        bulletList(block.data.industries?.items ?? []),
      ];
    case "homeExperience":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        ...(block.data.experience?.roles ?? [])
          .slice(0, block.data.count ?? undefined)
          .map(roleMarkdown),
        pageLink(block.data.seeAllLabel, block.data.seeAllLink, context),
      ];
    case "homeRecommendation": {
      // Same pick as the home view: the 1-based `position`, else the first recommendation
      const items = block.data.recommendations?.items ?? [];
      const featured = items[(block.data.position ?? 1) - 1] ?? items[0];
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        featured ? recommendationMarkdown(featured) : null,
      ];
    }
    case "homeContact":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        pageLink(block.data.buttonLabel, block.data.buttonLink, context),
      ];
    case "aboutHero":
      return [
        heading(`${block.data.headlineFirst} ${block.data.headlineSecond}`),
        paragraph(block.data.lead),
        bulletList(block.data.industries?.items ?? []),
      ];
    case "aboutStack":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        bulletList(
          block.data.groups.map(
            (group) => `**${text(group.name)}**: ${group.items.map(text).join(", ")}`,
          ),
        ),
      ];
    case "aboutExperience":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        ...(block.data.experience?.roles ?? []).map(roleMarkdown),
      ];
    case "aboutRecommendations":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        ...(block.data.recommendations?.items ?? []).map(recommendationMarkdown),
      ];
    case "aboutEducation":
      return [
        heading(block.data.title),
        paragraph(block.data.lede),
        ...block.data.items.map((item) =>
          [
            heading(item.school, 3),
            [item.degree, item.period].map(text).filter(Boolean).join(" · ") || null,
            item.skills.length > 0 ? `Skills: ${item.skills.map(text).join(", ")}` : null,
          ]
            .filter(Boolean)
            .join("\n\n"),
        ),
      ];
    case "ctaBanner":
      return [
        heading(block.data.title),
        paragraph(block.data.text),
        pageLink(block.data.linkLabel, block.data.link, context),
      ];
    case "contactsHero":
      return [paragraph(block.data.lead)];
    case "contactChannels":
      return [contactChannels()];
    case "blogHero":
      return [paragraph(block.data.lead)];
    case "blogFeed":
      return [heading("Posts"), linkList(context.posts)];
    case "blogTopics":
      return [
        heading(block.data.heading),
        paragraph(block.data.intro),
        bulletList(
          block.data.topics.map(
            (topic) => `**${text(topic.title)}**: ${text(topic.description)}`,
          ),
        ),
      ];
    case "legalHeader":
      return [
        block.data.updatedAt
          ? paragraph(`${block.data.lastUpdatedLabel} ${block.data.updatedAt.slice(0, 10)}`)
          : null,
      ];
    case "richText":
      return [heading(block.data.heading), htmlToMarkdown(block.data.html, 3) || null];
    case "cookieTable":
      return [heading(block.data.heading), paragraph(block.data.intro)];
    case "cookieSettings":
      return [heading(block.data.heading), paragraph(block.data.text)];
  }
}

function joinParts(parts: (string | null | undefined)[]): string {
  return `${parts.filter((part): part is string => Boolean(part)).join("\n\n")}\n`;
}

/** Markdown version of a CMS page: title, description, then its sections in order. */
export function cmsPageToMarkdown(page: WebsitePage, context: PageMarkdownContext): string {
  return joinParts([
    `# ${text(page.seo.title)}`,
    page.seo.description ? `> ${text(page.seo.description)}` : null,
    `Source: ${context.url}`,
    ...page.blocks.flatMap((block) => blockParts(block, context)),
  ]);
}

/** Markdown version of a blog post: title, lead, byline, cover, body. */
export function postToMarkdown(post: Post, url: string): string {
  const author = `${post.author.firstName} ${post.author.lastName}`.trim();
  const byline = [
    author ? `By ${author}` : null,
    `Published ${postDate(post).slice(0, 10)}`,
    `Updated ${post.updatedAt.slice(0, 10)}`,
    post.categories.length > 0
      ? `Topics: ${post.categories.map((category) => category.name).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return joinParts([
    `# ${text(post.title)}`,
    post.description ? `> ${text(post.description)}` : null,
    byline,
    `Source: ${url}`,
    post.imageUrl ? `![${text(post.coverAlt ?? post.title)}](${post.imageUrl})` : null,
    htmlToMarkdown(post.htmlContent),
  ]);
}
