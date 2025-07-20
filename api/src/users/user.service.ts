import { users } from "../db/schema"
import type { SqlDatabase } from "../types"
import type { User, UserRegistration } from "./user.schema"
import { hash } from "bcrypt-ts"

async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

async function registerUser(db: SqlDatabase, data: UserRegistration): Promise<User> {
  const { username, email, password } = data
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, username) || eq(users.email, email),
  })
  if (existingUser) {
    throw new Error("Username or email already exists")
  }
  const newUser = await db
    .insert(users)
    .values({
      username,
      email,
      passwordHash: await hashPassword(password),
    })
    .returning()

  if (newUser.length === 0) {
    throw new Error("Failed to create user")
  }

  const createdUser = newUser[0]
  return {
    id: createdUser.id,
    username: createdUser.username,
    email: createdUser.email,
    createdAt: createdUser.createdAt.toISOString(),
    updatedAt: createdUser.updatedAt.toISOString(),
  }
}

async function getUserById(db: SqlDatabase, userId: string): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  })
  if (!user) {
    throw new Error("User not found")
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export const userService = {
  register: registerUser,
  getUserById,
}