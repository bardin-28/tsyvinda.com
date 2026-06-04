import { useCallback, useState } from "react";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { requestPasswordReset } from "@/api/auth";

import type { RequestResetValues } from "./validation";

export function useRequestResetSubmit() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = useCallback(
    async (
      values: RequestResetValues,
      helpers: FormikHelpers<RequestResetValues>,
    ) => {
      setSubmitError(null);
      try {
        // The backend always returns the same generic 200 regardless of whether
        // the email is registered, so success here never confirms an account.
        await requestPasswordReset(values.email);
        setIsSubmitted(true);
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(data?.message ?? "Could not send reset email");
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
