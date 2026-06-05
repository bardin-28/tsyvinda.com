import { useCallback, useState } from "react";
import type { FormikHelpers } from "formik";

import { ApiError } from "@/api";
import { updateProfile } from "@/api/profile";
import { useUser } from "@/shared/contexts/UserContext";

import type { ProfileValues } from "./validation";

// How the avatar should change on save. `image` and `removeImage` are
// mutually exclusive on the backend, so they are modelled as one action.
export type ImageAction =
  | { type: "keep" }
  | { type: "replace"; file: File }
  | { type: "remove" };

type UseProfileSubmitOptions = {
  onSuccess: () => void;
  // Runs the Turnstile challenge and resolves the verification token.
  verifyTurnstile: () => Promise<string>;
};

export function useProfileSubmit({ onSuccess, verifyTurnstile }: UseProfileSubmitOptions) {
  const { setUser } = useUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitProfile = useCallback(
    async (
      values: ProfileValues,
      imageAction: ImageAction,
      helpers: FormikHelpers<ProfileValues>,
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
        const form = new FormData();
        form.append("firstName", values.firstName.trim());
        form.append("lastName", values.lastName.trim());

        if (imageAction.type === "replace") {
          form.append("image", imageAction.file);
        } else if (imageAction.type === "remove") {
          form.append("removeImage", "true");
        }

        const updated = await updateProfile(form, turnstileToken);
        setUser(updated);
        onSuccess();
      } catch (err) {
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setSubmitError(data?.message ?? "Could not save profile");
        } else {
          setSubmitError("Unexpected error. Try again.");
        }
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [onSuccess, setUser, verifyTurnstile],
  );

  return { submitProfile, submitError, setSubmitError };
}
