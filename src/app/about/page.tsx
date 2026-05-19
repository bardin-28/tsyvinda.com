"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { AVATAR, NAME } from "@/lib/site";
import styles from "./page.module.css";
import {
  EDUCATION,
  EXPERIENCE,
  HEADLINE_WORDS,
  INDUSTRIES,
  STACK,
  STATS,
} from "./data";

const AboutScene = dynamic(() => import("./AboutScene/AboutScene"), { ssr: false });

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
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

const wordVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

export default function About() {
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
          <Link href="/" className={styles.backLink} aria-label="Back to home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span>Home</span>
          </Link>
        </motion.nav>

        <section className={styles.hero}>
          <motion.div
            className={styles.heroLeft}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div className={styles.eyebrow} variants={itemVariants}>
              <span className={styles.dot} aria-hidden="true" />
              About me
            </motion.div>

            <motion.h1 className={styles.headline} variants={containerVariants}>
              {HEADLINE_WORDS.map((word) => (
                <motion.span key={word} className={styles.headlineWord} variants={wordVariants}>
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p className={styles.lead} variants={itemVariants}>
              Hands-on experience delivering scalable solutions across
              <span className={styles.leadAccent}> MedTech, FinTech, PropTech, TravelTech</span>
              {" and "}
              <span className={styles.leadAccent}>EdTech</span> industries.
            </motion.p>

            <motion.div className={styles.industries} variants={containerVariants}>
              {INDUSTRIES.map((industry) => (
                <motion.span key={industry} className={styles.industry} variants={itemVariants}>
                  {industry}
                </motion.span>
              ))}
            </motion.div>

            <motion.div className={styles.stats} variants={containerVariants}>
              {STATS.map((stat) => (
                <motion.div key={stat.label} className={styles.stat} variants={itemVariants}>
                  <span className={styles.statNumber}>{stat.number}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <div className={styles.avatarFrame}>
              <div className={styles.avatarGlow} aria-hidden="true" />
              <div className={styles.avatarRing} aria-hidden="true" />
              <Image
                src={AVATAR.url}
                alt={NAME}
                width={AVATAR.width}
                height={AVATAR.height}
                priority
                className={styles.avatarImg}
              />
            </div>
          </motion.div>
        </section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>01</span>
            <h2 className={styles.sectionTitle}>Stack</h2>
            <p className={styles.sectionLede}>
              Tools I reach for daily — from markup to delivery.
            </p>
          </motion.div>

          <motion.div className={styles.stackGrid} variants={containerVariants}>
            {STACK.map((group) => (
              <motion.div key={group.group} className={styles.stackCard} variants={itemVariants}>
                <h3 className={styles.stackGroup}>{group.group}</h3>
                <div className={styles.chips}>
                  {group.items.map((item) => (
                    <span key={item} className={styles.chip}>{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>02</span>
            <h2 className={styles.sectionTitle}>Experience</h2>
            <p className={styles.sectionLede}>
              Six years of frontend, lead, and full-stack delivery.
            </p>
          </motion.div>

          <div className={styles.timeline}>
            <div className={styles.timelineLine} aria-hidden="true" />
            {EXPERIENCE.map((role) => (
              <motion.article
                key={`${role.org}-${role.title}-${role.period}`}
                className={styles.timelineItem}
                variants={itemVariants}
              >
                <div className={styles.timelineDot} aria-hidden="true" />
                <div className={styles.timelineCard}>
                  <header className={styles.roleHead}>
                    <h3 className={styles.roleTitle}>{role.title}</h3>
                    <div className={styles.roleMeta}>
                      <span className={styles.roleOrg}>{role.org}</span>
                      {role.type && <span className={styles.roleType}>· {role.type}</span>}
                    </div>
                    <div className={styles.roleSub}>
                      <span>{role.period}</span>
                      {role.location && <span>· {role.location}</span>}
                    </div>
                  </header>
                  <ul className={styles.bullets}>
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionHead} variants={itemVariants}>
            <span className={styles.sectionTag}>03</span>
            <h2 className={styles.sectionTitle}>Education</h2>
            <p className={styles.sectionLede}>
              Formal background and active credentials.
            </p>
          </motion.div>

          <motion.div className={styles.eduGrid} variants={containerVariants}>
            {EDUCATION.map((edu) => (
              <motion.article key={edu.school} className={styles.eduCard} variants={itemVariants}>
                <div className={styles.eduPeriod}>{edu.period}</div>
                <h3 className={styles.eduSchool}>{edu.school}</h3>
                <p className={styles.eduDegree}>{edu.degree}</p>
                {edu.skills.length > 0 && (
                  <div className={styles.chips}>
                    {edu.skills.map((skill) => (
                      <span key={skill} className={styles.chip}>{skill}</span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.cta}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h2 className={styles.ctaTitle}>Let&rsquo;s build something.</h2>
          <p className={styles.ctaText}>
            Open to senior frontend / lead engineer roles. Reach me on any channel below.
          </p>
          <div className={styles.ctaLinks}>
            <Link href="/" className={styles.ctaLink}>
              <span>Contact channels</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
