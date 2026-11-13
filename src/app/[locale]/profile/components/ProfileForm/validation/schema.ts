import { z } from "zod";

/** Translates a key of the "profile.validation" messages. */
export type ProfileValidationTranslator = (key: string) => string;

export function buildProfileSchema(t: ProfileValidationTranslator) {
  return z.object({
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
  });
}

export type ProfileSchema = ReturnType<typeof buildProfileSchema>;
export type ProfileValues = z.infer<ProfileSchema>;

export function buildValidate(schema: ProfileSchema) {
  return (
    values: ProfileValues,
  ): Partial<Record<keyof ProfileValues, string>> => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Partial<Record<keyof ProfileValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof ProfileValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  };
}
