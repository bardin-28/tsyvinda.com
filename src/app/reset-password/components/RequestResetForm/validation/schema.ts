import { z } from "zod";

export const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .email("Invalid email"),
});

export type RequestResetValues = z.infer<typeof requestResetSchema>;

export const initialValues: RequestResetValues = { email: "" };

export const validate = (values: RequestResetValues) => {
  const result = requestResetSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof RequestResetValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof RequestResetValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};
