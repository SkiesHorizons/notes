import { middlewares } from "./middlewares"
import type { AppEnv } from "./types"
import { authController } from "./auth"
import { noteController } from "./notes"
import { userController } from "./users"
import { registerOpenApiDoc } from "./openapi"
import { OpenAPIHono } from "@hono/zod-openapi"

const app = new OpenAPIHono<AppEnv>()

app.use("/auth/*", middlewares.infrastructure)
app.route("/auth", authController)

app.use("/notes/*", middlewares.auth)
app.use("/notes/*", middlewares.infrastructure)
app.route("/notes", noteController)

app.use("/users/*", middlewares.auth)
app.use("/users/*", middlewares.infrastructure)
app.route("/users", userController)

registerOpenApiDoc(app)

// noinspection JSUnusedGlobalSymbols
export default app
