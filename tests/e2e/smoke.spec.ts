import { expect, test } from "@playwright/test";

test("landing and dashboard render with the Moon Base preset", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Flame in freefall/i })).toBeVisible();
  const moonPreset = page.locator('a[href="/dashboard?environment=moon"]');
  await expect(moonPreset).toContainText("Moon Base");
  await moonPreset.click();
  await expect(page).toHaveURL(/\/dashboard\?environment=moon/);
  await expect(page.getByRole("heading", { name: "Fire safety intelligence" })).toBeVisible();
  await expect(page.getByLabel("Select an environment")).toHaveValue("moon");
});

test("mobile and tablet layouts fit the viewport and expose full navigation", async ({ page }) => {
  test.setTimeout(90000);
  for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/dashboard?environment=moon", "/investigations", "/compare", "/assistant", "/data-gaps"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      expect(widths.document, `${route} at ${viewport.width}px should not create page-level horizontal scrolling`).toBeLessThanOrEqual(widths.viewport);
    }
    if (viewport.width <= 760) {
      await page.locator(".mobile-more summary").click();
      await expect(page.locator(".mobile-more-menu").getByRole("link", { name: "Data gaps" })).toBeVisible();
    } else {
      await expect(page.locator('aside[aria-label="Primary navigation"]').getByRole("link", { name: "Mission dashboard" })).toBeVisible();
    }
  }
});
