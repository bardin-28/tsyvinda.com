import { getTranslations } from "next-intl/server";

import { getPosts, postDate, postSlug } from "@/api/posts";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";
import { absoluteUrl } from "@/i18n/seo";
import { postPath } from "@/shared/cms/routes";
import { getRouteMap } from "@/shared/cms/api";

import { resolvePageMarkdown } from "../markdown/resolvePageMarkdown";
import { linkList } from "../markdown/pageMarkdown";
import { EMAIL, SITE_URL, SOCIAL_LINKS } from "../site";
import {
  GET_CONTACT_DETAILS_TOOL,
  GET_PAGE_TOOL,
  LIST_BLOG_POSTS_TOOL,
} from "./toolDefinitions";

/** Server-side implementations of the tools in `toolDefinitions.ts`. */

/** Bad arguments: reported to the agent as a tool error it can correct, not a protocol error. */
export class ToolInputError extends Error {}

export type ToolArguments = Record<string, unknown>;

const DEFAULT_POST_LIMIT = 20;
const MAX_POST_LIMIT = 50;
const MAX_PATH_LENGTH = 512;

const SITE_HOST = new URL(SITE_URL).hostname;
/** Hosts whose URLs `get_page` accepts (www redirects to the bare domain). */
const SITE_HOSTS: ReadonlySet<string> = new Set([SITE_HOST, `www.${SITE_HOST}`]);

function readLocale(args: ToolArguments): Locale {
  const value = args.locale;
  if (value === undefined) return DEFAULT_LOCALE;
  if (typeof value === "string" && isLocale(value)) return value;
  throw new ToolInputError('"locale" must be "en" or "uk".');
}

function readLimit(args: ToolArguments): number {
  const value = args.limit;
  if (value === undefined) return DEFAULT_POST_LIMIT;
  if (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_POST_LIMIT) {
    return value;
  }
  throw new ToolInputError(`"limit" must be an integer from 1 to ${MAX_POST_LIMIT}.`);
}

function readOptionalString(args: ToolArguments, name: string): string | undefined {
  const value = args[name];
  if (value === undefined) return undefined;
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new ToolInputError(`"${name}" must be a non-empty string.`);
}

/** "/about", "about" or "https://tsyvinda.com/about?x" → "/about"; other sites are refused. */
export function normalizeSitePath(input: unknown): string {
  if (typeof input !== "string" || !input.trim()) {
    throw new ToolInputError('"path" is required, e.g. "/about".');
  }
  const raw = input.trim();
  if (raw.length > MAX_PATH_LENGTH) throw new ToolInputError('"path" is too long.');
  let url: URL;
  try {
    url = new URL(raw.startsWith("/") || /^https?:\/\//i.test(raw) ? raw : `/${raw}`, SITE_URL);
  } catch {
    throw new ToolInputError(`"${raw}" is not a valid path.`);
  }
  if (!SITE_HOSTS.has(url.hostname)) {
    throw new ToolInputError(`Only pages of ${SITE_URL} can be read.`);
  }
  return url.pathname;
}

async function listBlogPosts(args: ToolArguments): Promise<string> {
  const locale = readLocale(args);
  const limit = readLimit(args);
  const category = readOptionalString(args, "category");
  const [{ items }, routeMap] = await Promise.all([
    getPosts({ limit, locale, category }),
    getRouteMap(),
  ]);
  if (items.length === 0) return "No published posts match.";
  return (
    linkList(
      items.map((post) => ({
        title: post.title,
        url: absoluteUrl(postPath(routeMap, postSlug(post, locale), locale), locale),
        description: [
          post.seoDescription || post.description,
          `published ${postDate(post).slice(0, 10)}`,
          post.categories.length > 0
            ? `topics: ${post.categories.map((item) => `${item.name} (${item.slug})`).join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join(" — "),
      })),
    ) ?? ""
  );
}

/** Follows one CMS redirect (old or other-language address) before giving up. */
async function getPage(args: ToolArguments): Promise<string> {
  const path = normalizeSitePath(args.path);
  let result = await resolvePageMarkdown(path);
  if (result.kind === "redirect") {
    result = await resolvePageMarkdown(normalizeSitePath(result.location));
  }
  if (result.kind === "markdown") return result.markdown;
  throw new ToolInputError(
    `No page at ${path}. Use list_blog_posts for post URLs, or read "/" for the main pages.`,
  );
}

async function getContactDetails(): Promise<string> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "common.site" });
  return [
    `# ${t("name")}`,
    `${t("jobTitle")} — ${t("city")}, ${t("country")}.`,
    `- Email: ${EMAIL}`,
    `- LinkedIn: ${SOCIAL_LINKS.linkedin}`,
    `- Telegram: ${SOCIAL_LINKS.telegram}`,
    `- Website: ${SITE_URL}`,
  ].join("\n");
}

const TOOL_HANDLERS: Record<string, (args: ToolArguments) => Promise<string>> = {
  [LIST_BLOG_POSTS_TOOL.name]: listBlogPosts,
  [GET_PAGE_TOOL.name]: getPage,
  [GET_CONTACT_DETAILS_TOOL.name]: getContactDetails,
};

export function isKnownTool(name: string): boolean {
  return Object.hasOwn(TOOL_HANDLERS, name);
}

/** Runs a known tool; throws `ToolInputError` for bad arguments. */
export function runAgentTool(name: string, args: ToolArguments): Promise<string> {
  return TOOL_HANDLERS[name](args);
}
