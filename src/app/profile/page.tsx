"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";

import { ProfileForm } from "./components/ProfileForm";
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

export default function ProfilePage() {
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
        <motion.section
          className={styles.heroWrap}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className={styles.eyebrow} variants={itemVariants}>
            <span className={styles.dot} aria-hidden="true" />
            Your account
          </motion.div>

          <motion.h1 className={styles.headline} variants={itemVariants}>
            Profile
          </motion.h1>

          <motion.p className={styles.lead} variants={itemVariants}>
            View and update your account details.
          </motion.p>

          <motion.div className={styles.card} variants={itemVariants}>
            <ProfileForm />
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}
