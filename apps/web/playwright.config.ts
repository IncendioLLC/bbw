import { defineConfig, devices } from "@playwright/test";

const port = 4180;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "../../work/playwright-results/web",
  reporter: "list",
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `next start --hostname 127.0.0.1 --port ${port}`,
    reuseExistingServer: false,
    timeout: 30_000,
    url: `${baseURL}/healthz`,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
