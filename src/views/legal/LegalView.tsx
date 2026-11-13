import { getFormatter } from "next-intl/server";

import { RichText, type Block } from "@/shared/cms";
import { CookieSettingsButton } from "@/shared/consent";

import type { CmsViewProps } from "../types";
import { CookieTable } from "./components/CookieTable/CookieTable";
import styles from "./LegalView.module.css";

type LegalBlockProps = { block: Block; formatDate: (iso: string) => string };

/** One section of a legal document (Privacy Policy, Cookie Policy). */
function LegalBlock({ block, formatDate }: LegalBlockProps) {
  switch (block.type) {
    case "legalHeader":
      return (
        <>
          <h1 className={styles.title}>{block.data.title}</h1>
          {block.data.updatedAt && (
            <p className={styles.updated}>
              {block.data.lastUpdatedLabel && (
                <strong>{block.data.lastUpdatedLabel}</strong>
              )}{" "}
              <time dateTime={block.data.updatedAt}>
                {formatDate(block.data.updatedAt)}
              </time>
            </p>
          )}
        </>
      );
    case "richText":
      return (
        <section id={block.anchor ?? undefined} className={styles.section}>
          {block.data.heading && <h2>{block.data.heading}</h2>}
          <RichText html={block.data.html} className={styles.richText} />
        </section>
      );
    case "cookieTable":
      return (
        <section id={block.anchor ?? undefined} className={styles.section}>
          {block.data.heading && <h2>{block.data.heading}</h2>}
          {block.data.intro && <p>{block.data.intro}</p>}
          <CookieTable />
        </section>
      );
    case "cookieSettings":
      return (
        <section id={block.anchor ?? undefined} className={styles.section}>
          {block.data.heading && <h2>{block.data.heading}</h2>}
          {block.data.text && <p>{block.data.text}</p>}
          <div>
            <CookieSettingsButton
              className={styles.settingsButton}
              label={block.data.buttonLabel}
            />
          </div>
        </section>
      );
    default:
      return null;
  }
}

/** Privacy Policy and Cookie Policy: a document of CMS sections in the order the editor set. */
export async function LegalView({ page, locale }: CmsViewProps) {
  const format = await getFormatter({ locale });
  const formatDate = (iso: string): string =>
    format.dateTime(new Date(`${iso}T00:00:00Z`), {
      dateStyle: "long",
      timeZone: "UTC",
    });
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <article className={styles.article}>
          {page.blocks.map((block) => (
            <LegalBlock key={block.id} block={block} formatDate={formatDate} />
          ))}
        </article>
      </main>
    </div>
  );
}
