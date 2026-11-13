import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import type { PageKey, WebsitePage } from "@/shared/cms";
import { getWebsitePage, resolveRoute } from "@/shared/cms/api";
import { cmsPageMetadata } from "@/shared/cms/metadata";
import { AboutView } from "@/views/about/AboutView";
import { BlogPageView } from "@/views/blog/BlogPageView";
import { ContactsView } from "@/views/contacts/ContactsView";
import { JsonLd } from "@/views/JsonLd";
import { LegalView } from "@/views/legal/LegalView";
import { PostView, postMetadata } from "@/views/post/PostView";
import { cmsPageSchemas } from "@/views/structuredData";

/**
 * Every CMS page except Home, and every blog post. **Load-bearing — do not delete.**
 * Page addresses are the API's per-language slugs (editable in the admin panel), so this route
 * asks the API what lives at the path (`GET /routes/resolve`): a page (rendered by its view),
 * a blog post, or a redirect (an old or other-language address → 308; an admin redirect →
 * 308/307). Anything else raises the miss inside `[locale]`, so the localised `not-found.tsx`
 * renders with layout and translations instead of Next's unstyled built-in page.
 */

type CatchAllProps = {
  params: Promise<{ locale: string; rest: string[] }>;
};

type ViewRenderer = (props: {
  page: WebsitePage;
  locale: Locale;
}) => React.ReactNode | Promise<React.ReactNode>;

/** Page key → its view. Home has its own route (fixed address). */
const VIEWS: Record<Exclude<PageKey, "home">, ViewRenderer> = {
  about: ({ page }) => <AboutView blocks={page.blocks} />,
  contacts: ({ page }) => <ContactsView blocks={page.blocks} />,
  blog: (props) => <BlogPageView {...props} />,
  "privacy-policy": (props) => <LegalView {...props} />,
  "cookie-policy": (props) => <LegalView {...props} />,
};

/** Views that emit their own JSON-LD (the blog lists its posts). */
const OWN_SCHEMAS: ReadonlySet<PageKey> = new Set(["blog"]);

const OPEN_GRAPH_TYPES: Partial<Record<PageKey, "profile">> = {
  about: "profile",
};

async function readParams(params: CatchAllProps["params"]) {
  const { locale, rest } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return { locale, path: `/${rest.map(decodeSegment).join("/")}` };
}

/** Next may hand over percent-encoded segments (Cyrillic slugs); the API wants them decoded. */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export async function generateMetadata({
  params,
}: CatchAllProps): Promise<Metadata> {
  const { locale, path } = await readParams(params);
  const route = await resolveRoute(path, locale);
  if (route?.kind === "post") {
    return postMetadata({ slug: route.slug, locale, paths: route.paths });
  }
  if (route?.kind !== "page" || route.key === "home") return {};
  const page = await getWebsitePage(route.key, locale);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: "common.site" });
  return cmsPageMetadata(page, {
    siteName: t("name"),
    openGraphType: OPEN_GRAPH_TYPES[route.key],
  });
}

export default async function CatchAllPage({ params }: CatchAllProps) {
  const { locale, path } = await readParams(params);
  setRequestLocale(locale);
  const route = await resolveRoute(path, locale);
  if (!route) notFound();

  if (route.kind === "redirect") {
    if (route.permanent) permanentRedirect(route.location);
    redirect(route.location);
  }
  if (route.kind === "post") {
    return <PostView slug={route.slug} locale={locale} paths={route.paths} />;
  }
  if (route.key === "home")
    redirect(locale === routing.defaultLocale ? "/" : `/${locale}`);

  const page = await getWebsitePage(route.key, locale);
  if (!page) notFound();
  const common = await getTranslations({ locale, namespace: "common" });
  const View = VIEWS[route.key];

  return (
    <>
      {!OWN_SCHEMAS.has(route.key) && (
        <JsonLd schemas={cmsPageSchemas(page, common("nav.home"))} />
      )}
      {await View({ page, locale })}
    </>
  );
}
