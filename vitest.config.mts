import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["tests/unit/support/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "coverage/unit",
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    projects: [
      {
        extends: false,
        test: {
          environment: "happy-dom",
          include: ["tests/unit/browser/**/*.test.ts"],
          name: "browser",
          setupFiles: ["./tests/unit/setup/browser.ts"],
        },
      },
      {
        extends: false,
        test: {
          environment: "node",
          include: ["tests/unit/node/**/*.test.ts"],
          name: "node",
        },
      },
      {
        extends: false,
        test: {
          environment: "node",
          include: ["tests/unit/shared/**/*.test.ts"],
          name: "shared",
        },
      },
    ],
  },
});
