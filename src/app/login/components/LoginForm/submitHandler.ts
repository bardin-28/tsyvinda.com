import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { login } from "@/api/auth";
import { useUser } from "@/shared/contexts/UserContext";
import { ROUTES } from "@/shared/const";

import type { LoginValues } from "./validation";

type UseLoginSubmitOptions = {
  redirectTo?: string;
};

export function useLoginSubmit({ redirectTo = ROUTES.HOME }: UseLoginSubmitOptions = {}) {
  const router = useRouter();
  const { setUser } = useUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (values: LoginValues, helpers: FormikHelpers<LoginValues>) => {
      setSubmitError(null);
      try {
        const user = await login(values);

        setUser(user);
        router.push(redirectTo);
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
    [redirectTo, router, setUser],
  );

  return { onSubmit, submitError };
}
