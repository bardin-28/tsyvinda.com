import { useCallback, useState } from "react";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { register } from "@/api/auth";

import type { RegisterValues } from "./validation";

export function useRegisterSubmit() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = useCallback(
    async (values: RegisterValues, helpers: FormikHelpers<RegisterValues>) => {
      setSubmitError(null);
      try {
        // Registration only triggers a verification email; it does not set a
        // session, so we switch to a confirmation panel rather than redirecting
        // into the authenticated area.
        await register({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        setIsSubmitted(true);
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          // 409 = email already registered; the backend message is shown as-is.
          setSubmitError(data?.message ?? "Could not create your account");
        } else {
          setSubmitError("Unexpected error. Try again.");
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [],
  );

  return { onSubmit, submitError, isSubmitted };
}
