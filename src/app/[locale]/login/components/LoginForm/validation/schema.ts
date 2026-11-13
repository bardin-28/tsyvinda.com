import { z } from "zod";

/** Translates a key of the "auth.validation" messages. */
export type LoginValidationTranslator = (key: string) => string;

export function buildLoginSchema(t: LoginValidationTranslator) {
  return z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z
      .string()
      .min(8, t("passwordMin"))
      .max(128, t("passwordTooLong")),
  });
}

export type LoginSchema = ReturnType<typeof buildLoginSchema>;
export type LoginValues = z.infer<LoginSchema>;

export const initialValues: LoginValues = { email: "", password: "" };

export function buildValidate(schema: LoginSchema) {
  return (values: LoginValues): Partial<Record<keyof LoginValues, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof LoginValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof LoginValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };
}
