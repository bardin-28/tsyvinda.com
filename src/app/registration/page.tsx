"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { ConfirmEmail } from "./components/ConfirmEmail";
import { RegisterForm } from "./components/RegisterForm";
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

// `useSearchParams` requires a Suspense boundary in the App Router. A `token`
// query param means the visitor followed the email verification link, so we
// confirm their email instead of rendering the signup form.
function RegistrationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const isConfirmMode = token.length > 0;

  const headline = isConfirmMode ? "Confirm email" : "Create account";
  const lead = isConfirmMode
    ? "We're verifying the link from your confirmation email."
    : "Sign up with your details and we'll email you a verification link to activate your account.";

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
        {isConfirmMode ? <ConfirmEmail token={token} /> : <RegisterForm />}
      </motion.div>
    </motion.section>
  );
}

export default function RegistrationPage() {
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
          <RegistrationContent />
        </Suspense>
      </main>
    </div>
  );
}
