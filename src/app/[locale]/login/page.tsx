"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { ROUTES } from "@/shared/const";

import { LoginForm } from "./components/LoginForm";
import styles from "./page.module.css";

const AboutScene = dynamic(
  () => import("@/views/about/components/AboutScene/AboutScene"),
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
  const t = useTranslations("auth.login");

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
        <motion.section
          className={styles.heroWrap}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1 className={styles.headline} variants={itemVariants}>
            {t("headline")}
          </motion.h1>

          <motion.p className={styles.lead} variants={itemVariants}>
            {t("lead")}
          </motion.p>

          <motion.div className={styles.card} variants={itemVariants}>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>

            <p className={styles.forgotRow}>
              <Link href={ROUTES.RESET_PASSWORD} className={styles.forgotLink}>
                {t("forgotPassword")}
              </Link>
            </p>

            <p className={styles.signupRow}>
              {t("noAccount")}{" "}
              <Link href={ROUTES.REGISTER} className={styles.forgotLink}>
                {t("createAccount")}
              </Link>
            </p>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
