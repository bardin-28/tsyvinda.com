"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ROUTES } from "@/shared/const";
import { AuthButton } from "@/shared/components";
import { DEFAULT_COVER, getSizePreset, type CoverState } from "./const";
import { CoverControls } from "./components/CoverControls";
import type { CoverComposerHandle } from "./components/CoverComposer";
import styles from "./page.module.css";

const CoverComposer = dynamic(
  () =>
    import("./components/CoverComposer").then((m) => ({
      default: m.CoverComposer,
    })),
  { ssr: false }
);

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "blog-cover";
}

export default function CoverGeneratorPage() {
  const [state, setState] = useState<CoverState>(DEFAULT_COVER);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const composerRef = useRef<CoverComposerHandle | null>(null);

  const updateField = useCallback(
    <K extends keyof CoverState>(key: K, value: CoverState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setState(DEFAULT_COVER);
  }, []);

  const handleDownload = useCallback(async () => {
    const handle = composerRef.current;
    if (!handle) return;
    setIsDownloading(true);
    try {
      await handle.download(`${slugify(state.title)}.jpg`);
    } finally {
      setIsDownloading(false);
    }
  }, [state.title]);

  const size = getSizePreset(state.sizeId);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <nav className={styles.topNav}>
        <Link href={ROUTES.BLOG} className={styles.backLink} aria-label="Back to blog">
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
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Back to blog</span>
        </Link>
        <AuthButton />
      </nav>

      <main className={styles.main}>
        <section className={styles.preview}>
          <div className={styles.previewMeta}>
            <span className={styles.previewMetaTag}>
              <span className={styles.previewMetaDot} aria-hidden="true" />
              Preview
            </span>
            <span>
              {size.width} × {size.height}
            </span>
          </div>
          <CoverComposer ref={composerRef} state={state} />
        </section>

        <aside>
          <CoverControls
            state={state}
            onChange={updateField}
            onReset={handleReset}
            onDownload={handleDownload}
            isDownloading={isDownloading}
          />
        </aside>
      </main>
    </div>
  );
}
