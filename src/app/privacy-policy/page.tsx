import type { Metadata } from "next";

import {
  PRIVACY_POLICY_EMAIL,
  PRIVACY_POLICY_UPDATED_AT,
  PRIVACY_POLICY_UPDATED_AT_ISO,
  privacyPolicyBreadcrumbSchema,
  privacyPolicyMetadata,
  privacyPolicyPageSchema,
} from "./const/seo";
import styles from "./page.module.css";

export const metadata: Metadata = privacyPolicyMetadata;

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyPolicyPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyPolicyBreadcrumbSchema),
        }}
      />

      <main className={styles.main}>
        <article className={styles.article}>
          <h1 className={styles.title}>Privacy Policy</h1>

          <p className={styles.updated}>
            <strong>Last updated:</strong>{" "}
            <time dateTime={PRIVACY_POLICY_UPDATED_AT_ISO}>
              {PRIVACY_POLICY_UPDATED_AT}
            </time>
          </p>

          <p>
            Welcome to <strong>tsyvinda.com</strong>.
          </p>

          <p>
            By accessing or using this website, you acknowledge that you have read and
            accepted this Privacy Policy and the terms described below. If you do not
            agree with these terms, please leave the website and discontinue its use.
          </p>

          <p>
            This website may collect information that you voluntarily provide, including
            your name, email address, and any information you submit through forms or
            other features. In addition, technical information such as your IP address,
            browser, operating system, device type, and anonymous usage statistics may be
            collected automatically.
          </p>

          <p>
            The information collected is used to maintain the website, improve its
            functionality, analyze usage, enhance the user experience, detect abuse, and
            develop new features. Your information is not sold for advertising or
            marketing purposes.
          </p>

          <p>
            All personal data is securely stored on servers located within the{" "}
            <strong>European Union (EU)</strong>. Appropriate technical and organizational
            measures are implemented to protect your information from unauthorized access,
            alteration, or loss. While every reasonable effort is made to ensure security,
            no online service can guarantee absolute protection.
          </p>

          <p>
            In certain circumstances, your information may be shared with trusted third
            parties when reasonably necessary to operate the website, provide
            infrastructure or analytics services, comply with legal obligations, or protect
            the rights and security of the website and its users.
          </p>

          <p>
            This website may use cookies and similar technologies to improve performance,
            remember user preferences, and collect anonymous analytics. You may disable
            cookies in your browser settings, although doing so may affect certain features
            of the website.
          </p>

          <p>
            The website provides the ability to create a user account. Registration does{" "}
            <strong>not</strong> guarantee access to all features of the website. Certain
            functionality, including but not limited to publishing content, creating public
            materials, or accessing restricted areas, may require additional approval,
            verification, invitation, or may remain unavailable at the sole discretion of
            the website administrator.
          </p>

          <p>
            The website owner reserves the right to suspend, restrict, or terminate access
            to any account or feature at any time, with or without prior notice, where
            permitted by applicable law.
          </p>

          <p>
            Any disputes, claims, or legal proceedings arising from the use of this website
            or this Privacy Policy shall be governed by the laws of{" "}
            <strong>Ukraine</strong> and resolved exclusively by the competent courts of
            Ukraine.
          </p>

          <p>
            If you have any questions, requests, or concerns regarding this Privacy Policy
            or your personal data, you may contact:
          </p>

          <p>
            <a
              className={styles.link}
              href={`mailto:${PRIVACY_POLICY_EMAIL}`}
            >
              <strong>{PRIVACY_POLICY_EMAIL}</strong>
            </a>
          </p>

          <p>
            This Privacy Policy may be updated at any time. The latest version will always
            be available on this page, and continued use of the website after changes are
            published constitutes acceptance of the updated policy.
          </p>
        </article>
      </main>
    </div>
  );
}
