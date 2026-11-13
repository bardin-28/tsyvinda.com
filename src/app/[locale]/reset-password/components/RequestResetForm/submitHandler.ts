import { useCallback, useState } from "react";
import type { FormikHelpers } from "formik";
import { useTranslations } from "next-intl";

import { ApiError } from "@/api";
import { requestPasswordReset } from "@/api/auth";

import type { RequestResetValues } from "./validation";

type UseRequestResetSubmitOptions = {
  // Runs the Turnstile challenge and resolves the verification token.
  verifyTurnstile: () => Promise<string>;
};

export function useRequestResetSubmit({
  verifyTurnstile,
}: UseRequestResetSubmitOptions) {
  const t = useTranslations("auth.errors");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = useCallback(
    async (
      values: RequestResetValues,
      helpers: FormikHelpers<RequestResetValues>,
    ) => {
      setSubmitError(null);

      let turnstileToken: string;
      try {
        turnstileToken = await verifyTurnstile();
      } catch {
        setSubmitError(t("verificationFailed"));
        helpers.setSubmitting(false);
        return;
      }

      try {
        // The backend always returns the same generic 200 regardless of whether
        // the email is registered, so success here never confirms an account.
        await requestPasswordReset(values.email, turnstileToken);
        setIsSubmitted(true);
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(data?.message ?? t("resetEmailFailed"));
        } else {
          setSubmitError(t("unexpected"));
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [verifyTurnstile, t],
  );

  return { onSubmit, submitError, isSubmitted };
}
