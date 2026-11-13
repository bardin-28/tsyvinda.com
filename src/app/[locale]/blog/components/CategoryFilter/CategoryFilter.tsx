"use client";

import { useTranslations } from "next-intl";

import type { PostCategory } from "@/api/posts";
import styles from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  categories: PostCategory[];
  /** Selected category slug; null = all posts */
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

/** "All" plus one chip per category; acts as a single-choice group of toggle buttons. */
export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  const t = useTranslations("blog.filter");
  if (categories.length === 0) return null;

  const chips: { slug: string | null; name: string }[] = [
    { slug: null, name: t("all") },
    ...categories.map((category) => ({
      slug: category.slug,
      name: category.name,
    })),
  ];

  return (
    <nav className={styles.filter} aria-label={t("label")}>
      {chips.map((chip) => {
        const isActive = chip.slug === selected;
        return (
          <button
            key={chip.slug ?? "all"}
            type="button"
            className={
              isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip
            }
            aria-pressed={isActive}
            onClick={() => onSelect(chip.slug)}
          >
            {chip.name}
          </button>
        );
      })}
    </nav>
  );
}
