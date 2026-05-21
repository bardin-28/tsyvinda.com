"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { ROUTES } from "@/shared/const";

import { LoginForm } from "./components/LoginForm";
import styles from "./page.module.css";

const AboutScene = dynamic(
  () => import("@/app/about/components/AboutScene/AboutScene"),
  { ssr: false },
);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

export default function LoginPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.page}>
      {!reduceMotion && <AboutScene />}

      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <motion.nav
          className={styles.topNav}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Link href={ROUTES.HOME} className={styles.backLink} aria-label="Back to home">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Home</span>
          </Link>
        </motion.nav>

        <motion.section
          className={styles.heroWrap}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className={styles.eyebrow} variants={itemVariants}>
            <span className={styles.dot} aria-hidden="true" />
            Welcome back
          </motion.div>

          <motion.h1 className={styles.headline} variants={itemVariants}>
            Sign in
          </motion.h1>

          <motion.p className={styles.lead} variants={itemVariants}>
            Use your email and password to access your account.
          </motion.p>

          <motion.div className={styles.card} variants={itemVariants}>
            <LoginForm />
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
