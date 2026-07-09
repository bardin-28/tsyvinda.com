"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AVATAR, NAME } from "@/shared/lib/site";
import { ROUTES } from "@/shared/const";
import { SOCIAL_NAV } from "@/shared/const/social";
import styles from "./page.module.css";
import {
  ABOUT_TEASER_LEAD,
  EASE,
  FEATURED_EXPERIENCE,
  FEATURED_RECOMMENDATION,
  INDUSTRIES,
  NAME_WORDS,
  ROLE_PRIMARY,
  ROLE_SECONDARY,
  SECTION_ABOUT,
  SECTION_CONTACT,
  SECTION_EXPERIENCE,
  SECTION_RECOMMENDATION,
  containerVariants,
  roleVariants,
  sectionContainerVariants,
  sectionItemVariants,
  wordVariants,
} from "./const";

import SmoothScroll from "@/app/(home)/components/SmoothScroll/SmoothScroll";

const ScrollOloidScene = dynamic(
  () => import("@/app/(home)/components/ScrollOloidScene/ScrollOloidScene"),
  { ssr: false },
);

const ARROW_ICON = (
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
);

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <SmoothScroll>
      <div className={styles.page} ref={pageRef}>
        {!reduceMotion && <ScrollOloidScene />}

        <div className={styles.blobs} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
        </div>

        <div className={styles.noise} aria-hidden="true" />

        <main className={styles.main}>
          {/* Section 1 — Hero */}
          <section className={styles.hero}>
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
                <motion.span key={word} className={styles.nameWord} variants={wordVariants}>
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
                {ARROW_ICON}
              </Link>
              <Link href={ROUTES.ABOUT} className={styles.ctaGhost}>
                <span>More about me</span>
              </Link>
            </motion.div>

            <motion.div
              className={styles.scrollCue}
              style={{ opacity: reduceMotion ? 1 : cueOpacity }}
              aria-hidden="true"
            >
              <span className={styles.scrollCueText}>Scroll</span>
              <span className={styles.scrollCueLine} />
            </motion.div>
          </section>

          {/* Section 2 — About teaser */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div className={styles.sectionHead} variants={sectionItemVariants}>
              <span className={styles.sectionTag}>{SECTION_ABOUT.tag}</span>
              <h2 className={styles.sectionTitle}>{SECTION_ABOUT.title}</h2>
              <p className={styles.sectionLede}>{SECTION_ABOUT.lede}</p>
            </motion.div>

            <motion.p className={styles.teaserLead} variants={sectionItemVariants}>
              {ABOUT_TEASER_LEAD}
            </motion.p>

            <motion.div className={styles.industries} variants={sectionContainerVariants}>
              {INDUSTRIES.map((industry) => (
                <motion.span key={industry} className={styles.industry} variants={sectionItemVariants}>
                  {industry}
                </motion.span>
              ))}
            </motion.div>
          </motion.section>

          {/* Section 3 — Experience */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div className={styles.sectionHead} variants={sectionItemVariants}>
              <span className={styles.sectionTag}>{SECTION_EXPERIENCE.tag}</span>
              <h2 className={styles.sectionTitle}>{SECTION_EXPERIENCE.title}</h2>
              <p className={styles.sectionLede}>{SECTION_EXPERIENCE.lede}</p>
            </motion.div>

            <div className={styles.timeline}>
              <div className={styles.timelineLine} aria-hidden="true" />
              {FEATURED_EXPERIENCE.map((role) => (
                <motion.article
                  key={`${role.org}-${role.title}-${role.period}`}
                  className={styles.timelineItem}
                  variants={sectionItemVariants}
                >
                  <div className={styles.timelineDot} aria-hidden="true" />
                  <div className={styles.timelineCard}>
                    <header className={styles.roleHead}>
                      <h3 className={styles.roleTitle}>{role.title}</h3>
                      <div className={styles.roleMeta}>
                        <span className={styles.roleOrg}>{role.org}</span>
                        {role.type && <span className={styles.roleType}>· {role.type}</span>}
                      </div>
                      <div className={styles.roleSubMeta}>
                        <span>{role.period}</span>
                        {role.location && <span>· {role.location}</span>}
                      </div>
                    </header>
                    <p className={styles.roleSummary}>{role.bullets[0]}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div variants={sectionItemVariants}>
              <Link href={ROUTES.ABOUT} className={styles.inlineLink}>
                <span>See full experience</span>
                {ARROW_ICON}
              </Link>
            </motion.div>
          </motion.section>

          {/* Section 4 — Recommendation */}
          <motion.section
            className={styles.section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div className={styles.sectionHead} variants={sectionItemVariants}>
              <span className={styles.sectionTag}>{SECTION_RECOMMENDATION.tag}</span>
              <h2 className={styles.sectionTitle}>{SECTION_RECOMMENDATION.title}</h2>
              <p className={styles.sectionLede}>{SECTION_RECOMMENDATION.lede}</p>
            </motion.div>

            <motion.figure className={styles.recCard} variants={sectionItemVariants}>
              <blockquote className={styles.recQuote}>
                {FEATURED_RECOMMENDATION.quote.map((para) => (
                  <p key={para} className={styles.recPara}>{para}</p>
                ))}
              </blockquote>
              <figcaption className={styles.recFooter}>
                <span className={styles.recName}>{FEATURED_RECOMMENDATION.name}</span>
                <span className={styles.recRole}>{FEATURED_RECOMMENDATION.role}</span>
                <span className={styles.recRelation}>{FEATURED_RECOMMENDATION.relation}</span>
              </figcaption>
            </motion.figure>
          </motion.section>

          {/* Section 5 — Contact */}
          <motion.section
            className={styles.contact}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
            variants={sectionContainerVariants}
          >
            <motion.div className={styles.sectionHead} variants={sectionItemVariants}>
              <span className={styles.sectionTag}>{SECTION_CONTACT.tag}</span>
              <h2 className={styles.sectionTitle}>{SECTION_CONTACT.title}</h2>
              <p className={styles.sectionLede}>{SECTION_CONTACT.lede}</p>
            </motion.div>

            <motion.div className={styles.contactGrid} variants={sectionContainerVariants}>
              {SOCIAL_NAV.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className={styles.contactLink}
                  variants={sectionItemVariants}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={`${item.label} — ${item.handle}`}
                >
                  <span className={styles.contactIcon} aria-hidden="true">{item.icon}</span>
                  <span className={styles.contactMeta}>
                    <span className={styles.contactLabel}>{item.label}</span>
                    <span className={styles.contactHandle}>{item.handle}</span>
                  </span>
                </motion.a>
              ))}
            </motion.div>

            <motion.div className={styles.contactCta} variants={sectionItemVariants}>
              <Link
                href={ROUTES.CONTACTS}
                className={styles.ctaButton}
                aria-label="Get in touch with Vladyslav Tsyvinda"
              >
                <span>Get in touch</span>
                {ARROW_ICON}
              </Link>
            </motion.div>
          </motion.section>
        </main>
      </div>
    </SmoothScroll>
  );
}
