"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AVATAR, NAME } from "@/shared/lib/site";
import { ROUTES } from "@/shared/const";
import { AuthButton } from "@/shared/components";
import styles from "./page.module.css";
import {
  EASE,
  LINKS,
  NAME_WORDS,
  ROLE_PRIMARY,
  ROLE_SECONDARY,
  containerVariants,
  linkVariants,
  roleVariants,
  wordVariants,
} from "./const";

const CylinderScene = dynamic(() => import("@/app/(home)/components/CylinderScene/CylinderScene"), { ssr: false });

export default function Home() {
  return (
    <div className={styles.page}>
      <CylinderScene />

      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.noise} aria-hidden="true" />

      <motion.nav
        className={styles.topNav}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      >
        <AuthButton />
      </motion.nav>

      <main className={styles.main}>
        <motion.div
          className={styles.avatar}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Image
            src={AVATAR.url}
            alt={NAME}
            width={88}
            height={88}
            priority
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>

        <motion.h1
          className={styles.nameWrap}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {NAME_WORDS.map((word) => (
            <motion.span
              key={word}
              className={styles.nameWord}
              variants={wordVariants}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className={styles.role}
          variants={roleVariants}
          initial="hidden"
          animate="show"
        >
          <span className={styles.roleDot} aria-hidden="true" />
          <span className={styles.roleText}>{ROLE_PRIMARY}</span>
          <span className={styles.roleDivider} aria-hidden="true">·</span>
          <span className={styles.roleSub}>{ROLE_SECONDARY}</span>
        </motion.p>

        <motion.div
          className={styles.links}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {LINKS.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.link} ${link.className}`}
              variants={linkVariants}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            >
              {link.icon}
              <span>{link.label}</span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          className={styles.secondaryLinks}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.85 }}
        >
          <Link href={ROUTES.ABOUT} className={styles.aboutLink} aria-label="Read about Vladyslav Tsyvinda">
            <span>More about me</span>
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
          <Link href={ROUTES.BLOG} className={styles.blogLink} aria-label="Read the blog">
            <span>Read the blog</span>
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
        </motion.div>
      </main>
    </div>
  );
}
