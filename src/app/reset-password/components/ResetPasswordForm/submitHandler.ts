import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { resetPassword } from "@/api/auth";
import { ROUTES } from "@/shared/const";

import type { ResetPasswordValues } from "./validation";

// Backend tokens are 32-128 chars (auth.schema.ts). The FE only shape-checks the
// token to decide whether to render the reset form; the backend remains the
// source of truth for validity and returns 400 for expired/unknown tokens.
const TOKEN_MIN_LENGTH = 32;
const TOKEN_MAX_LENGTH = 128;

export function isValidTokenShape(token: string): boolean {
  return token.length >= TOKEN_MIN_LENGTH && token.length <= TOKEN_MAX_LENGTH;
}

// Time the success panel stays up before sending the user to sign in.
export const REDIRECT_DELAY_MS = 2000;

type UseResetPasswordSubmitOptions = {
  token: string;
  // Runs the Turnstile challenge and resolves the verification token.
  verifyTurnstile: () => Promise<string>;
};

export function useResetPasswordSubmit({
  token,
  verifyTurnstile,
}: UseResetPasswordSubmitOptions) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isSubmitted) return;
    const timer = window.setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isSubmitted, router]);

  const onSubmit = useCallback(
    async (
      values: ResetPasswordValues,
      helpers: FormikHelpers<ResetPasswordValues>,
    ) => {
      setSubmitError(null);

      let turnstileToken: string;
      try {
        turnstileToken = await verifyTurnstile();
      } catch {
        setSubmitError("Verification failed. Please try again.");
        helpers.setSubmitting(false);
        return;
      }

      try {
        await resetPassword(
          {
            token,
            password: values.password,
            confirmPassword: values.confirmPassword,
          },
          turnstileToken,
        );
        setIsSubmitted(true);
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(
            data?.message ?? "This reset link is invalid or has expired.",
          );
        } else {
          setSubmitError("Unexpected error. Try again.");
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [token, verifyTurnstile],
  );

  return { onSubmit, submitError, isSubmitted };
}
