"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Block, BlockData, PageLink } from "@/shared/cms";
import { SOCIAL_NAV } from "@/shared/const/social";
import { AVATAR } from "@/shared/lib/site";
import { CtaBanner } from "@/views/shared/CtaBanner/CtaBanner";
import { RichTextSection } from "@/views/shared/RichTextSection/RichTextSection";

import {
  EASE,
  containerVariants,
  roleVariants,
  sectionContainerVariants,
  sectionItemVariants,
  wordVariants,
} from "../../const";
import styles from "../../page.module.css";
import SmoothScroll from "../SmoothScroll/SmoothScroll";

const ScrollOloidScene = dynamic(
  () => import("../ScrollOloidScene/ScrollOloidScene"),
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

/** Path of a CMS page link; null hides the link (page not published in this language). */
const hrefOf = (link: PageLink): string | null => link?.path ?? null;

type SectionHeadData = { tag: string; title: string; lede: string };

/** Section revealed on scroll, opened by its eyebrow number, title and lede. */
function RevealSection({
  head,
  anchor,
  className = styles.section,
  children,
}: {
  head: SectionHeadData;
  anchor: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={anchor ?? undefined}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={sectionContainerVariants}
    >
      <motion.div className={styles.sectionHead} variants={sectionItemVariants}>
        {head.tag && <span className={styles.sectionTag}>{head.tag}</span>}
        <h2 className={styles.sectionTitle}>{head.title}</h2>
        {head.lede && <p className={styles.sectionLede}>{head.lede}</p>}
      </motion.div>
      {children}
    </motion.section>
  );
}

function HomeHero({
  data,
  cueOpacity,
}: {
  data: BlockData<"homeHero">;
  cueOpacity: MotionValue<number> | number;
}) {
  const nameWords = [data.firstName, data.lastName].filter(Boolean);
  const contactHref = hrefOf(data.contactLink);
  const aboutHref = hrefOf(data.aboutLink);
  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.avatar}
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Image
          src={data.avatar || AVATAR.url}
          alt={data.avatarAlt}
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
        {nameWords.map((word) => (
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
        <span className={styles.roleText}>{data.rolePrimary}</span>
        {data.roleSecondary && (
          <>
            <span className={styles.roleDivider} aria-hidden="true">
              ·
            </span>
            <span className={styles.roleSub}>{data.roleSecondary}</span>
          </>
        )}
      </motion.p>

      <motion.div
        className={styles.cta}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
      >
        {contactHref && (
          <Link
            href={contactHref}
            className={styles.ctaButton}
            aria-label={data.contactAriaLabel || undefined}
          >
            <span>{data.contactLabel}</span>
            {ARROW_ICON}
          </Link>
        )}
        {aboutHref && data.aboutLabel && (
          <Link href={aboutHref} className={styles.ctaGhost}>
            <span>{data.aboutLabel}</span>
          </Link>
        )}
      </motion.div>

      {data.scrollLabel && (
        <motion.div
          className={styles.scrollCue}
          style={{ opacity: cueOpacity }}
          aria-hidden="true"
        >
          <span className={styles.scrollCueText}>{data.scrollLabel}</span>
          <span className={styles.scrollCueLine} />
        </motion.div>
      )}
    </section>
  );
}

function HomeAbout({
  data,
  anchor,
}: {
  data: BlockData<"homeAbout">;
  anchor: string | null;
}) {
  return (
    <RevealSection head={data} anchor={anchor}>
      {data.lead && (
        <motion.p className={styles.teaserLead} variants={sectionItemVariants}>
          {data.lead}
        </motion.p>
      )}
      {data.industries && (
        <motion.div
          className={styles.industries}
          variants={sectionContainerVariants}
        >
          {data.industries.items.map((industry) => (
            <motion.span
              key={industry}
              className={styles.industry}
              variants={sectionItemVariants}
            >
              {industry}
            </motion.span>
          ))}
        </motion.div>
      )}
    </RevealSection>
  );
}

function HomeExperience({
  data,
  anchor,
}: {
  data: BlockData<"homeExperience">;
  anchor: string | null;
}) {
  const roles = (data.experience?.roles ?? []).slice(
    0,
    data.count ?? undefined,
  );
  const seeAllHref = hrefOf(data.seeAllLink);
  return (
    <RevealSection head={data} anchor={anchor}>
      <div className={styles.timeline}>
        <div className={styles.timelineLine} aria-hidden="true" />
        {roles.map((role) => (
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
                  {role.type && (
                    <span className={styles.roleType}>· {role.type}</span>
                  )}
                </div>
                <div className={styles.roleSubMeta}>
                  <span>{role.period}</span>
                  {role.location && <span>· {role.location}</span>}
                </div>
              </header>
              {role.bullets[0] && (
                <p className={styles.roleSummary}>{role.bullets[0]}</p>
              )}
            </div>
          </motion.article>
        ))}
      </div>
      {seeAllHref && data.seeAllLabel && (
        <motion.div variants={sectionItemVariants}>
          <Link href={seeAllHref} className={styles.inlineLink}>
            <span>{data.seeAllLabel}</span>
            {ARROW_ICON}
          </Link>
        </motion.div>
      )}
    </RevealSection>
  );
}

function HomeRecommendation({
  data,
  anchor,
}: {
  data: BlockData<"homeRecommendation">;
  anchor: string | null;
}) {
  const items = data.recommendations?.items ?? [];
  const featured = items[(data.position ?? 1) - 1] ?? items[0];
  if (!featured) return null;
  return (
    <RevealSection head={data} anchor={anchor}>
      <motion.figure className={styles.recCard} variants={sectionItemVariants}>
        <blockquote className={styles.recQuote}>
          {featured.quote.map((para) => (
            <p key={para} className={styles.recPara}>
              {para}
            </p>
          ))}
        </blockquote>
        <figcaption className={styles.recFooter}>
          <span className={styles.recName}>{featured.name}</span>
          <span className={styles.recRole}>{featured.role}</span>
          {featured.relation && (
            <span className={styles.recRelation}>{featured.relation}</span>
          )}
        </figcaption>
      </motion.figure>
    </RevealSection>
  );
}

function HomeContact({
  data,
  anchor,
}: {
  data: BlockData<"homeContact">;
  anchor: string | null;
}) {
  const tCommon = useTranslations("common");
  const buttonHref = hrefOf(data.buttonLink);
  return (
    <RevealSection head={data} anchor={anchor} className={styles.contact}>
      <motion.div
        className={styles.contactGrid}
        variants={sectionContainerVariants}
      >
        {SOCIAL_NAV.map((item) => {
          const isExternal = item.href.startsWith("http");
          const label = tCommon(`social.${item.labelKey}`);
          return (
            <motion.a
              key={item.href}
              href={item.href}
              className={styles.contactLink}
              variants={sectionItemVariants}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={`${label} — ${item.handle}`}
            >
              <span className={styles.contactIcon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.contactMeta}>
                <span className={styles.contactLabel}>{label}</span>
                <span className={styles.contactHandle}>{item.handle}</span>
              </span>
            </motion.a>
          );
        })}
      </motion.div>
      {buttonHref && data.buttonLabel && (
        <motion.div
          className={styles.contactCta}
          variants={sectionItemVariants}
        >
          <Link
            href={buttonHref}
            className={styles.ctaButton}
            aria-label={data.buttonAriaLabel || undefined}
          >
            <span>{data.buttonLabel}</span>
            {ARROW_ICON}
          </Link>
        </motion.div>
      )}
    </RevealSection>
  );
}

function HomeBlock({
  block,
  cueOpacity,
}: {
  block: Block;
  cueOpacity: MotionValue<number> | number;
}) {
  switch (block.type) {
    case "homeHero":
      return <HomeHero data={block.data} cueOpacity={cueOpacity} />;
    case "homeAbout":
      return <HomeAbout data={block.data} anchor={block.anchor} />;
    case "homeExperience":
      return <HomeExperience data={block.data} anchor={block.anchor} />;
    case "homeRecommendation":
      return <HomeRecommendation data={block.data} anchor={block.anchor} />;
    case "homeContact":
      return <HomeContact data={block.data} anchor={block.anchor} />;
    case "ctaBanner":
      return <CtaBanner data={block.data} anchor={block.anchor} />;
    case "richText":
      return <RichTextSection data={block.data} anchor={block.anchor} />;
    default:
      return null;
  }
}

export type HomeViewProps = { blocks: Block[] };

/** Home page: the oloid scene behind the CMS sections, with momentum scrolling. */
export function HomeView({ blocks }: HomeViewProps) {
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
          {blocks.map((block) => (
            <HomeBlock
              key={block.id}
              block={block}
              cueOpacity={reduceMotion ? 1 : cueOpacity}
            />
          ))}
        </main>
      </div>
    </SmoothScroll>
  );
}
