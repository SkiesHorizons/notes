import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "http://localhost:8080/openapi",
  output: {
    path: "./src/lib/api",
    lint: "eslint",
    format: "prettier",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      exportFromIndex: true,
    },
    {
      name: "zod",
      exportFromIndex: true,
    },
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/sdk",
      auth: true,
      transformer: true,
      validator: {
        request: "zod",
      },
    },
    {
      name: "@tanstack/react-query",
      exportFromIndex: true,
      queryOptions: {
        name: (name) => `${name}QueryOptions`,
      },
      mutationOptions: {
        name: (name) => `${name}MutationOptions`,
      },
    },
  ],
})
