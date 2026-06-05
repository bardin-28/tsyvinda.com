"use client";

import Link from "next/link";
import { Formik, Form, Field, FieldProps } from "formik";
import { Input, Button } from "antd";

import { ROUTES } from "@/shared/const";
import { useTurnstile } from "@/shared/turnstile";

import styles from "./ResetPasswordForm.module.css";
import { initialValues, validate } from "./validation";
import { isValidTokenShape, useResetPasswordSubmit } from "./submitHandler";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { containerRef, execute } = useTurnstile();
  const { onSubmit, submitError, isSubmitted } = useResetPasswordSubmit({
    token,
    verifyTurnstile: execute,
  });

  // Guard malformed/empty tokens before showing the form. The backend still
  // re-validates on submit, but this avoids a pointless request and gives the
  // user a clear recovery path.
  if (!isValidTokenShape(token)) {
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
        <p className={styles.panelTitle}>Invalid reset link</p>
        <p className={styles.muted}>
          This password reset link is missing or malformed. Request a new one to
          continue.
        </p>
        <p className={styles.footer}>
          <Link href={ROUTES.RESET_PASSWORD} className={styles.footerLink}>
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  if (isSubmitted) {
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
        <p className={styles.panelTitle}>Password updated</p>
        <p className={styles.muted}>
          Your password has been changed. Redirecting you to sign in…
        </p>
        <p className={styles.footer}>
          <Link href={ROUTES.LOGIN} className={styles.footerLink}>
            Go to sign in
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
            <label htmlFor="password" className={styles.label}>
              New password
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
              <span className={styles.hint}>
                At least 8 characters, including a letter and a number.
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm new password
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
              <span className={styles.fieldError}>{errors.confirmPassword}</span>
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
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>

          <p className={styles.footer}>
            Remember your password?{" "}
            <Link href={ROUTES.LOGIN} className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
