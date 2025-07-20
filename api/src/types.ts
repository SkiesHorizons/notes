import type { JwtVariables } from "hono/jwt"
import type * as schema from "./db/schema"
import { NodePgDatabase } from "drizzle-orm/node-postgres"

export type AppEnv = {
  Bindings: CloudflareBindings
  Variables: JwtVariables<JwtPayload> & {
    db: SqlDatabase
  }
}

export type JwtPayload = {
  sub: string // subject (user ID)
  exp: number // expiration time
  iat: number // issued at time
}

export type SqlDatabase = NodePgDatabase<typeof schema>
