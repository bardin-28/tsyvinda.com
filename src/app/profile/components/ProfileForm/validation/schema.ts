import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export const validate = (values: ProfileValues) => {
  const result = profileSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof ProfileValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProfileValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};
