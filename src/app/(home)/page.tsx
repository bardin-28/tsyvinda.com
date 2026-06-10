"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AVATAR, NAME } from "@/shared/lib/site";
import { ROUTES } from "@/shared/const";
import styles from "./page.module.css";
import {
  EASE,
  NAME_WORDS,
  ROLE_PRIMARY,
  ROLE_SECONDARY,
  containerVariants,
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
          <span className={styles.roleText}>{ROLE_PRIMARY}</span>
          <span className={styles.roleDivider} aria-hidden="true">·</span>
          <span className={styles.roleSub}>{ROLE_SECONDARY}</span>
        </motion.p>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        >
          <Link
            href={ROUTES.CONTACTS}
            className={styles.ctaButton}
            aria-label="Get in touch with Vladyslav Tsyvinda"
          >
            <span>Get in touch</span>
            <svg
              width="16"
              height="16"
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
