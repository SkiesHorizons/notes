import { z } from "@hono/zod-openapi"

export const zLoginCredentials = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
}).openapi("LoginCredentials")

export type LoginCredentials = z.infer<typeof zLoginCredentials>

export const zAuthTokens = z.object({
  accessToken: z.string(),
}).openapi("AuthTokens")

export type AuthTokens = z.infer<typeof zAuthTokens>