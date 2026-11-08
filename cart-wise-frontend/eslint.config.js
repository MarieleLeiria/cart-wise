import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const networkApis = ["fetch", "XMLHttpRequest", "WebSocket", "sendBeacon"];

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    ignores: ["dist/", "coverage/", "node_modules/", "playwright-report/", "eslint.config.js"],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022,
        chrome: "readonly",
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...networkApis.map((name) => ({
          selector: `CallExpression[callee.name="${name}"]`,
          message: `Network API ${name} is forbidden in src (STD-SEC-003).`,
        })),
      ],
    },
  },
  {
    files: ["src/content/**/*.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "@/storage/.*",
              message: "Content scripts must not import storage (STD-FILE-002).",
            },
          ],
        },
      ],
    },
  },
);
