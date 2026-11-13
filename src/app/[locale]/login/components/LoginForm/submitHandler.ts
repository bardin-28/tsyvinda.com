import { useCallback, useState } from "react";
import { useRouter as useNextRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { login } from "@/api/auth";
import { useUser } from "@/shared/contexts/UserContext";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/shared/const";

import type { LoginValues } from "./validation";

type UseLoginSubmitOptions = {
  redirectTo?: string;
  // Runs the Turnstile challenge and resolves the verification token.
  verifyTurnstile: () => Promise<string>;
};

export function useLoginSubmit({
  redirectTo,
  verifyTurnstile,
}: UseLoginSubmitOptions) {
  // Locale-aware router for unprefixed app routes; plain router for `from`, which is
  // already a full (possibly "/uk"-prefixed) path set by the proxy.
  const router = useRouter();
  const nextRouter = useNextRouter();
  const t = useTranslations("auth.errors");
  const searchParams = useSearchParams();
  const { refetch } = useUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: LoginValues, helpers: FormikHelpers<LoginValues>) => {
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
        await login(values, turnstileToken);

        // The login response is not the full profile shape; load the
        // canonical user from GET /profile before navigating.
        await refetch();

        // Only a path on this site ("/…", not "//host" or a full URL): no open redirect
        const fromParam: string | null = searchParams.get("from");
        const fromPath: string | null =
          fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")
            ? fromParam
            : null;
        if (redirectTo) {
          router.push(redirectTo);
        } else if (fromPath) {
          nextRouter.push(fromPath);
        } else {
          router.push(ROUTES.PROFILE);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(data?.message ?? t("loginFailed"));
        } else {
          setSubmitError(t("unexpected"));
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [redirectTo, router, nextRouter, searchParams, refetch, verifyTurnstile, t],
  );

  return { onSubmit, submitError };
}
