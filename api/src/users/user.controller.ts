import { AppEnv } from "../types"
import { userService } from "./user.service"
import { zUser } from "./user.schema"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"

const me = createRoute({
  method: "get",
  path: "/@me",
  tags: ["User"],
  operationId: "getCurrentUser",
  summary: "Get current user",
  description: "Retrieve the details of the currently authenticated user.",
  security: [{
    bearerAuth: [],
  }],
  responses: {
    200: {
      description: "User details",
      content: {
        "application/json": {
          schema: zUser,
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
})

const app = new OpenAPIHono<AppEnv>()

app.openapi(me, async (c) => {
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  const user = await userService.getUserById(db, userId)
  if (!user) {
    return c.newResponse("Unauthorized", 401)
  }

  return c.json(user, 200)
})


export const userController = app