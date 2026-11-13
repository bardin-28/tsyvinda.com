import { z } from "zod";

/** Translates a key of the "auth.validation" messages. */
export type RegisterValidationTranslator = (key: string) => string;

// Mirrors the backend register contract (auth.schema.ts): names are trimmed and
// 1-50 chars, email is a valid address up to 255 chars, the password policy is
// 8-72 chars with at least one letter and one digit, and the confirmation must
// match. The backend remains the source of truth and re-validates on submit.
export function buildRegisterSchema(t: RegisterValidationTranslator) {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t("firstNameRequired"))
        .max(50, t("firstNameTooLong")),
      lastName: z
        .string()
        .trim()
        .min(1, t("lastNameRequired"))
        .max(50, t("lastNameTooLong")),
      email: z
        .string()
        .min(1, t("emailRequired"))
        .max(255, t("emailTooLong"))
        .email(t("emailInvalid")),
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

export type RegisterSchema = ReturnType<typeof buildRegisterSchema>;
export type RegisterValues = z.infer<RegisterSchema>;

export const initialValues: RegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function buildValidate(schema: RegisterSchema) {
  return (
    values: RegisterValues,
  ): Partial<Record<keyof RegisterValues, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof RegisterValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof RegisterValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };
}
