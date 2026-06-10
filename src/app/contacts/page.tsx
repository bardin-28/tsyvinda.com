"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SOCIAL_NAV } from "@/shared/const";
import styles from "./page.module.css";

const LocationMap = dynamic(
  () => import("./components/LocationMap/LocationMap"),
  {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder} aria-hidden="true" />,
  },
);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

export default function ContactsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>

      <div className={styles.noise} aria-hidden="true" />

      <main className={styles.main}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h1 className={styles.title}>
            Let&rsquo;s <span className={styles.titleAccent}>work together</span>
          </h1>
          <p className={styles.lead}>
            Based in <span className={styles.titleAccent}>Kyiv, Ukraine</span>,
            and work with teams across time zones. <br/>
            Open to new projects and collaboration — reach me on any channel below
            and I&rsquo;ll usually reply within a day.
          </p>
          <LocationMap />
        </motion.section>

        <motion.ul
          className={styles.channels}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {SOCIAL_NAV.map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <motion.li key={item.label} variants={itemVariants}>
                <a
                  href={item.href}
                  className={styles.channel}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={`${item.label}: ${item.handle}`}
                >
                  <span className={styles.channelIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>{item.label}</span>
                    <span className={styles.channelHandle}>{item.handle}</span>
                  </span>
                  <span className={styles.channelArrow} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      </main>
    </div>
  );
}
