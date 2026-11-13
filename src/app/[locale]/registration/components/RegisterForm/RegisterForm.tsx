"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Formik, Form, Field, FieldProps } from "formik";
import { Input, Button } from "antd";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";
import { useTurnstile } from "@/shared/turnstile";

import styles from "./RegisterForm.module.css";
import {
  buildRegisterSchema,
  buildValidate,
  initialValues,
} from "./validation";
import { useRegisterSubmit } from "./submitHandler";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const validate = useMemo(
    () => buildValidate(buildRegisterSchema((key: string) => tValidation(key))),
    [tValidation],
  );
  const { containerRef, execute } = useTurnstile();
  const { onSubmit, submitError, isSubmitted } = useRegisterSubmit({
    verifyTurnstile: execute,
  });

  if (isSubmitted) {
    return (
      <div className={styles.successPanel} role="status">
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
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </span>
        <p className={styles.successTitle}>{t("links.checkInbox")}</p>
        <p className={styles.muted}>{t("registration.successText")}</p>
        <p className={styles.footer}>
          <Link href={ROUTES.LOGIN} className={styles.footerLink}>
            {t("links.goToSignIn")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      validateOnBlur
      validateOnChange={false}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched, handleSubmit }) => (
        <Form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="firstName" className={styles.label}>
              {t("fields.firstName")}
            </label>
            <Field name="firstName">
              {({ field }: FieldProps<string>) => (
                <Input
                  {...field}
                  id="firstName"
                  placeholder={t("fields.firstNamePlaceholder")}
                  autoComplete="given-name"
                  size="large"
                  status={
                    errors.firstName && touched.firstName ? "error" : undefined
                  }
                />
              )}
            </Field>
            {errors.firstName && touched.firstName && (
              <span className={styles.fieldError}>{errors.firstName}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName" className={styles.label}>
              {t("fields.lastName")}
            </label>
            <Field name="lastName">
              {({ field }: FieldProps<string>) => (
                <Input
                  {...field}
                  id="lastName"
                  placeholder={t("fields.lastNamePlaceholder")}
                  autoComplete="family-name"
                  size="large"
                  status={
                    errors.lastName && touched.lastName ? "error" : undefined
                  }
                />
              )}
            </Field>
            {errors.lastName && touched.lastName && (
              <span className={styles.fieldError}>{errors.lastName}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              {t("fields.email")}
            </label>
            <Field name="email">
              {({ field }: FieldProps<string>) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  size="large"
                  status={errors.email && touched.email ? "error" : undefined}
                />
              )}
            </Field>
            {errors.email && touched.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              {t("fields.password")}
            </label>
            <Field name="password">
              {({ field }: FieldProps<string>) => (
                <Input.Password
                  {...field}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  size="large"
                  status={
                    errors.password && touched.password ? "error" : undefined
                  }
                />
              )}
            </Field>
            {errors.password && touched.password ? (
              <span className={styles.fieldError}>{errors.password}</span>
            ) : (
              <span className={styles.hint}>{t("fields.passwordHint")}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              {t("fields.confirmPassword")}
            </label>
            <Field name="confirmPassword">
              {({ field }: FieldProps<string>) => (
                <Input.Password
                  {...field}
                  id="confirmPassword"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  size="large"
                  status={
                    errors.confirmPassword && touched.confirmPassword
                      ? "error"
                      : undefined
                  }
                />
              )}
            </Field>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.fieldError}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {submitError && (
            <div className={styles.submitError} role="alert">
              {submitError}
            </div>
          )}

          {/* Invisible Cloudflare Turnstile widget; runs on submit. */}
          <div ref={containerRef} className={styles.turnstile} />

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting
              ? t("registration.submitting")
              : t("registration.submit")}
          </Button>

          <p className={styles.footer}>
            {t("registration.haveAccount")}{" "}
            <Link href={ROUTES.LOGIN} className={styles.footerLink}>
              {t("links.signIn")}
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
