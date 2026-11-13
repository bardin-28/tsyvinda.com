"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";
import { useUser } from "@/shared/contexts/UserContext";

import styles from "./AuthButton.module.css";

type AuthButtonProps = {
  className?: string;
};

export function AuthButton({ className }: AuthButtonProps) {
  const { user, logout } = useUser();
  const t = useTranslations("auth.authButton");
  const classes = className ? `${styles.button} ${className}` : styles.button;

  if (user) {
    return (
      <div className={styles.group}>
        <Link
          href={ROUTES.PROFILE}
          className={styles.button}
          aria-label={t("profile")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{t("profile")}</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className={classes}
          aria-label={t("logOut")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span>{t("logOut")}</span>
        </button>
      </div>
    );
  }

  return (
    <Link href={ROUTES.LOGIN} className={classes} aria-label={t("signIn")}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
      <span>{t("signIn")}</span>
    </Link>
  );
}
