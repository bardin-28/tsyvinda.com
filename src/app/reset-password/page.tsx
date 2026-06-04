"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { RequestResetForm } from "./components/RequestResetForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
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

// `useSearchParams` requires a Suspense boundary in the App Router; the inner
// component reads the reset token and chooses which half of the flow to show.
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const isResetMode = token.length > 0;

  const headline = isResetMode ? "New password" : "Reset password";
  const lead = isResetMode
    ? "Choose a new password for your account."
    : "Enter your email and we'll send you a link to reset your password.";

  return (
    <motion.section
      className={styles.heroWrap}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h1 className={styles.headline} variants={itemVariants}>
        {headline}
      </motion.h1>

      <motion.p className={styles.lead} variants={itemVariants}>
        {lead}
      </motion.p>

      <motion.div className={styles.card} variants={itemVariants}>
        {isResetMode ? (
          <ResetPasswordForm token={token} />
        ) : (
          <RequestResetForm />
        )}
      </motion.div>
    </motion.section>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={null}>
          <ResetPasswordContent />
        </Suspense>
      </main>
    </div>
  );
}
