"use client";

import { motion } from "framer-motion";

import { Link } from "@/i18n/navigation";
import type { BlockData } from "@/shared/cms";

import styles from "./CtaBanner.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type CtaBannerProps = {
  data: BlockData<"ctaBanner">;
  anchor?: string | null;
};

/** Closing call to action: title, text and one button to another page. */
export function CtaBanner({ data, anchor }: CtaBannerProps) {
  const href = data.link?.path;
  return (
    <motion.section
      id={anchor ?? undefined}
      className={styles.cta}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <h2 className={styles.ctaTitle}>{data.title}</h2>
      {data.text && <p className={styles.ctaText}>{data.text}</p>}
      {href && data.linkLabel && (
        <div className={styles.ctaLinks}>
          <Link href={href} className={styles.ctaLink}>
            <span>{data.linkLabel}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </motion.section>
  );
}
