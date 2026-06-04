import { z } from "zod";

// Mirrors the backend password policy (auth.schema.ts): 8-72 chars, at least
// one letter and one digit, and the confirmation must match.
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const initialValues: ResetPasswordValues = {
  password: "",
  confirmPassword: "",
};

export const validate = (values: ResetPasswordValues) => {
  const result = resetPasswordSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof ResetPasswordValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ResetPasswordValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};
