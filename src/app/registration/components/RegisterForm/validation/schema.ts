import { z } from "zod";

// Mirrors the backend register contract (auth.schema.ts): names are trimmed and
// 1-50 chars, email is a valid address up to 255 chars, the password policy is
// 8-72 chars with at least one letter and one digit, and the confirmation must
// match. The backend remains the source of truth and re-validates on submit.
export const registerSchema = z
  .object({
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
    email: z
      .string()
      .min(1, "Email is required")
      .max(255, "Email is too long")
      .email("Invalid email"),
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

export type RegisterValues = z.infer<typeof registerSchema>;

export const initialValues: RegisterValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const validate = (values: RegisterValues) => {
  const result = registerSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof RegisterValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof RegisterValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};
