import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { login } from "@/api/auth";
import { useUser } from "@/shared/contexts/UserContext";
import { ROUTES } from "@/shared/const";

import type { LoginValues } from "./validation";

type UseLoginSubmitOptions = {
  redirectTo?: string;
};

export function useLoginSubmit({ redirectTo }: UseLoginSubmitOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: LoginValues, helpers: FormikHelpers<LoginValues>) => {
      setSubmitError(null);
      try {
        await login(values);

        // The login response is not the full profile shape; load the
        // canonical user from GET /profile before navigating.
        await refetch();

        const target = redirectTo ?? searchParams.get("from") ?? ROUTES.PROFILE;
        router.push(target);
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(data?.message ?? "Login failed");
        } else {
          setSubmitError("Unexpected error. Try again.");
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [redirectTo, router, searchParams, refetch],
  );

  return { onSubmit, submitError };
}
