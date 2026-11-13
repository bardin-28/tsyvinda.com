import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { jsonLd } from "@/shared/lib/schemas";

import { loadPrivacyPolicySeoCopy } from "./const/copy";
import {
  PRIVACY_POLICY_EMAIL,
  PRIVACY_POLICY_UPDATED_AT_ISO,
  buildPrivacyPolicyBreadcrumbSchema,
  buildPrivacyPolicyMetadata,
  buildPrivacyPolicyPageSchema,
} from "./const/seo";
import styles from "./page.module.css";

type PrivacyPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

/** Renders `<strong>…</strong>` tags inside the policy's translated paragraphs. */
const richStrong = { strong: (chunks: ReactNode) => <strong>{chunks}</strong> };

export async function generateMetadata({
  params,
}: PrivacyPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildPrivacyPolicyMetadata(
    locale,
    await loadPrivacyPolicySeoCopy(locale),
  );
}

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });
  const seoCopy = await loadPrivacyPolicySeoCopy(locale);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildPrivacyPolicyPageSchema(locale, seoCopy)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildPrivacyPolicyBreadcrumbSchema(locale, seoCopy)),
        }}
      />

      <main className={styles.main}>
        <article className={styles.article}>
          <h1 className={styles.title}>{t("title")}</h1>

          <p className={styles.updated}>
            <strong>{t("lastUpdated")}</strong>{" "}
            <time dateTime={PRIVACY_POLICY_UPDATED_AT_ISO}>
              {t("updatedAt")}
            </time>
          </p>

          <p>{t.rich("welcome", richStrong)}</p>
          <p>{t("acceptance")}</p>
          <p>{t("collection")}</p>
          <p>{t("usage")}</p>
          <p>{t.rich("storage", richStrong)}</p>
          <p>{t("sharing")}</p>
          <p>{t("cookies")}</p>
          <p>{t.rich("accounts", richStrong)}</p>
          <p>{t("termination")}</p>
          <p>{t.rich("jurisdiction", richStrong)}</p>
          <p>{t("contact")}</p>

          <p>
            <a className={styles.link} href={`mailto:${PRIVACY_POLICY_EMAIL}`}>
              <strong>{PRIVACY_POLICY_EMAIL}</strong>
            </a>
          </p>

          <p>{t("changes")}</p>
        </article>
      </main>
    </div>
  );
}
