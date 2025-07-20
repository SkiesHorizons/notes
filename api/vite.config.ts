import { cloudflare } from "@cloudflare/vite-plugin"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    minify: true,
  },
  server: {
    port: 8080,
  },
})
