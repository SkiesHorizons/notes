import { z } from "@hono/zod-openapi"

export const zUser = z.object({
  id: z.uuid(),
  username: z.string().min(3).max(32),
  email: z.string().max(64),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi("User")

export type User = z.infer<typeof zUser>

export const zUserRegistration = z.object({
  username: z
    .string()
    .nonempty({
      message: "Username is required",
    })
    .min(3, {
      message: "Username must be at least 3 characters long",
    })
    .max(32, {
      message: "Username must be at most 32 characters long",
    })
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/, {
      message: "Username must start with a letter and contain only letters, numbers, and underscores",
    }),
  email: z
    .email({ message: "Invalid email address" })
    .nonempty({
      message: "Email is required",
    })
    .max(64, {
      message: "Email must be at most 64 characters long",
    }),
  password: z
    .string()
    .nonempty({
      message: "Password is required",
    })
    .min(6, {
      message: "Password must be at least 6 characters long",
    })
    .max(64, {
      message: "Password must be at most 64 characters long",
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
}).openapi("UserRegistration")

export type UserRegistration = z.infer<typeof zUserRegistration>
