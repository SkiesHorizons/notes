import { sign } from "hono/jwt"
import type { JwtPayload, SqlDatabase } from "../types"
import type { AuthTokens, LoginCredentials } from "./auth.schema"
import { compare } from "bcrypt-ts"

async function generateJwt(secret: string, userId: string): Promise<string> {
  const payload: JwtPayload = {
    sub: userId, // subject
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    iat: Math.floor(Date.now() / 1000), // issued at
  }
  return await sign(payload, secret)
}

async function login(db: SqlDatabase, secret: string, data: LoginCredentials): Promise<AuthTokens> {
  const { username, password } = data
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username),
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (!user.passwordHash) {
    throw new Error("Password not set for user")
  }

  const isValid = await compare(password, user.passwordHash)
  if (!isValid) {
    throw new Error("Invalid password")
  }

  return {
    accessToken: await generateJwt(secret, user.id),
  }
}

export const authService = {
  login,
}
