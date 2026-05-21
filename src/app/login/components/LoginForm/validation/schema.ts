import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const initialValues: LoginValues = { email: "", password: "" };

export const validate = (values: LoginValues) => {
  const result = loginSchema.safeParse(values);
  if (result.success) return {};

  const errors: Partial<Record<keyof LoginValues, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof LoginValues;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
};
