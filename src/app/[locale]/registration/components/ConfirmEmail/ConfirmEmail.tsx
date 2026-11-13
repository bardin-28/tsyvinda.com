"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";

import styles from "./ConfirmEmail.module.css";
import { useConfirmEmail } from "./submitHandler";

type ConfirmEmailProps = {
  token: string;
};

export function ConfirmEmail({ token }: ConfirmEmailProps) {
  const t = useTranslations("auth");
  const { status, errorMessage } = useConfirmEmail(token);

  if (status === "verifying") {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.panelTitle}>{t("confirmEmail.verifyingTitle")}</p>
        <p className={styles.muted}>{t("confirmEmail.verifyingText")}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={styles.panel} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className={styles.panelTitle}>{t("confirmEmail.successTitle")}</p>
        <p className={styles.muted}>{t("confirmEmail.successText")}</p>
        <p className={styles.footer}>
          <Link href={ROUTES.LOGIN} className={styles.footerLink}>
            {t("links.goToSignIn")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel} role="alert">
      <span className={styles.errorIcon} aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </span>
      <p className={styles.panelTitle}>{t("confirmEmail.errorTitle")}</p>
      <p className={styles.muted}>{errorMessage}</p>
      <p className={styles.footer}>
        <Link href={ROUTES.REGISTER} className={styles.footerLink}>
          {t("confirmEmail.createNewAccount")}
        </Link>
      </p>
    </div>
  );
}
