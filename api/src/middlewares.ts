import { drizzle } from "drizzle-orm/node-postgres"
import { createMiddleware } from "hono/factory"
import { jwt } from "hono/jwt"
import * as schema from "./db/schema"
import type { AppEnv } from "./types"

const infrastructure = createMiddleware<AppEnv>(async (c, next) => {
  const db = drizzle(c.env.DATABASE_URL, {
    schema: schema,
  })

  c.set("db", db)
  await next()
})

const auth = createMiddleware<AppEnv>(async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})

export const middlewares = {
  infrastructure,
  auth,
}
