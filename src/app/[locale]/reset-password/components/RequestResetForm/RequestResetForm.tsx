"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Formik, Form, Field, FieldProps } from "formik";
import { Input, Button } from "antd";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";
import { useTurnstile } from "@/shared/turnstile";

import styles from "./RequestResetForm.module.css";
import {
  buildRequestResetSchema,
  buildValidate,
  initialValues,
} from "./validation";
import { useRequestResetSubmit } from "./submitHandler";

export function RequestResetForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const validate = useMemo(
    () =>
      buildValidate(buildRequestResetSchema((key: string) => tValidation(key))),
    [tValidation],
  );
  const { containerRef, execute } = useTurnstile();
  const { onSubmit, submitError, isSubmitted } = useRequestResetSubmit({
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
        <p className={styles.muted}>{t("requestReset.successText")}</p>
        <p className={styles.footer}>
          <Link href={ROUTES.LOGIN} className={styles.footerLink}>
            {t("links.backToSignIn")}
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
              ? t("requestReset.submitting")
              : t("requestReset.submit")}
          </Button>

          <p className={styles.footer}>
            {t("links.rememberPassword")}{" "}
            <Link href={ROUTES.LOGIN} className={styles.footerLink}>
              {t("links.signIn")}
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
