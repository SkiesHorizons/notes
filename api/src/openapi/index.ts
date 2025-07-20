import { AppEnv } from "../types"
import { OpenAPIHono } from "@hono/zod-openapi"

export const registerOpenApiDoc = (app: OpenAPIHono<AppEnv>) => {
  app.doc31("/openapi", (c) => ({
    openapi: "3.1.0",
    info: {
      title: "SH-Note API",
      version: "1.0.0",
    },
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: "Current environment",
      },
    ],
  }))
  app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: {
      title: "",
      version: "1.0.0",
    },
  })
  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  })
}
