import { pgTable } from "drizzle-orm/pg-core"

export const users = pgTable("users", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  username: t.varchar("username", { length: 32 }).notNull().unique(),
  email: t.varchar("email", { length: 64 }).notNull().unique(),
  passwordHash: t.varchar("password_hash", { length: 128 }),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const notes = pgTable("notes", (t) => ({
  id: t.uuid("id").primaryKey().defaultRandom(),
  userId: t
    .uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: t.varchar("title", { length: 256 }),
  content: t.text("content").notNull(),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
  updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))
