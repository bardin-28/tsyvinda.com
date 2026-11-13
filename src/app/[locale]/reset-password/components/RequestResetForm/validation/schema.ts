import { z } from "zod";

/** Translates a key of the "auth.validation" messages. */
export type RequestResetValidationTranslator = (key: string) => string;

export function buildRequestResetSchema(t: RequestResetValidationTranslator) {
  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .max(255, t("emailTooLong"))
      .email(t("emailInvalid")),
  });
}

export type RequestResetSchema = ReturnType<typeof buildRequestResetSchema>;
export type RequestResetValues = z.infer<RequestResetSchema>;

export const initialValues: RequestResetValues = { email: "" };

export function buildValidate(schema: RequestResetSchema) {
  return (
    values: RequestResetValues,
  ): Partial<Record<keyof RequestResetValues, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof RequestResetValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof RequestResetValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };
}
