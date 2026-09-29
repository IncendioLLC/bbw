import { expect, test } from "@playwright/test";

test("loads and supports interaction", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("BBW browser smoke fixture");
  await expect(page.getByRole("heading", { name: "BBW browser testing is ready" })).toBeVisible();

  await page.getByRole("button", { name: "Verify interaction" }).click();
  await expect(page.getByRole("status")).toHaveText("Interaction verified.");
});
