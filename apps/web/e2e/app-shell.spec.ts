import { expect, test } from "@playwright/test";

test("renders the public home route", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("BBW Platform");
  await expect(
    page.getByRole("heading", { name: "The Growth Infrastructure for Biotech Innovation" }),
  ).toBeVisible();
});

test("redirects an unauthenticated visitor away from a member route", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: "Sign in to BBW" })).toBeVisible();
});

test("exposes a health endpoint", async ({ request }) => {
  const response = await request.get("/healthz");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  await expect(response.json()).resolves.toEqual({ service: "web", status: "ok" });
});
