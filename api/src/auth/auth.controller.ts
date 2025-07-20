import { AppEnv } from "../types"
import { userService, zUser, zUserRegistration } from "../users"
import { zAuthTokens, zLoginCredentials } from "./auth.schema"
import { authService } from "./auth.service"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"


const register = createRoute({
  method: "post",
  path: "/register",
  tags: ["Auth"],
  operationId: "register",
  summary: "Register a new user",
  description: "Creates a new user account with the provided registration details.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: zUserRegistration,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: zUser,
        },
      },
    },
    400: {
      description: "Invalid input data",
    },
  },
})

const login = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  operationId: "login",
  summary: "User login",
  description: "Authenticates a user and returns access tokens.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: zLoginCredentials,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: zAuthTokens,
        },
      },
    },
    401: {
      description: "Invalid credentials",
    },
  },
})

const app = new OpenAPIHono<AppEnv>()

app.openapi(register, async (c) => {
  const data = c.req.valid("json")
  const db = c.get("db")

  const user = await userService.register(db, data)
  return c.json(user, 201)
})

app.openapi(login, async (c) => {
  const data = c.req.valid("json")
  const db = c.get("db")
  const secret = c.env.JWT_SECRET

  const tokens = await authService.login(db, secret, data)
  return c.json(tokens, 200)
})

export const authController = app
