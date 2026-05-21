"use client";

import { Formik, Form, Field, FieldProps } from "formik";
import { Input, Button } from "antd";

import styles from "./LoginForm.module.css";
import { initialValues, validate } from "./validation";
import { useLoginSubmit } from "./submitHandler";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps = {}) {
  const { onSubmit, submitError } = useLoginSubmit({ redirectTo });

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
              Email
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
              Password
            </label>
            <Field name="password">
              {({ field }: FieldProps<string>) => (
                <Input.Password
                  {...field}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  size="large"
                  status={errors.password && touched.password ? "error" : undefined}
                />
              )}
            </Field>
            {errors.password && touched.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          {submitError && (
            <div className={styles.submitError} role="alert">
              {submitError}
            </div>
          )}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
