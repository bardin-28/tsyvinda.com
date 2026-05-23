"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/shared/const";
import { AuthButton } from "@/shared/components";
import styles from "./ArticleNav.module.css";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ArticleNav() {
  return (
    <motion.nav
      className={styles.topNav}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
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
        <span>All posts</span>
      </Link>
      <AuthButton />
    </motion.nav>
  );
}
