import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "demo/**",
      "doc/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "cdk.out/**",
      "**/cdk.out/**",
      ".next/**",
      ".turbo/**",
      "**/.next/**",
      "**/.turbo/**",
      "progress.html",
    ],
  },
  {
    ...eslint.configs.recommended,
    languageOptions: {
      ...eslint.configs.recommended.languageOptions,
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "off",
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
    },
  },
);
