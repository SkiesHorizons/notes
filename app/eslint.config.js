import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { globalIgnores } from "eslint/config"
import mantine from "eslint-config-mantine"
import pluginQuery from "@tanstack/eslint-plugin-query"

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  ...pluginQuery.configs["flat/recommended"],
  ...mantine,
  { ignores: ["**/*.{mjs,cjs,js,d.ts,d.mts}", "src-tauri"] },
])
