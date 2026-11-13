import { z } from "zod";

/** Translates a key of the "auth.validation" messages. */
export type ResetPasswordValidationTranslator = (key: string) => string;

// Mirrors the backend password policy (auth.schema.ts): 8-72 chars, at least
// one letter and one digit, and the confirmation must match.
export function buildResetPasswordSchema(t: ResetPasswordValidationTranslator) {
  return z
    .object({
      password: z
        .string()
        .min(8, t("passwordMin"))
        .max(72, t("passwordTooLong"))
        .regex(/[A-Za-z]/, t("passwordLetter"))
        .regex(/[0-9]/, t("passwordDigit")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: t("passwordsMismatch"),
        });
      }
    });
}

export type ResetPasswordSchema = ReturnType<typeof buildResetPasswordSchema>;
export type ResetPasswordValues = z.infer<ResetPasswordSchema>;

export const initialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export function buildValidate(schema: ResetPasswordSchema) {
  return (
    values: ResetPasswordValues,
  ): Partial<Record<keyof ResetPasswordValues, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof ResetPasswordValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof ResetPasswordValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };
}
