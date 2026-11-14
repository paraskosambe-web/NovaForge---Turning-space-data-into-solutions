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
  test.setTimeout(180000);
  const routes = [
    ["home", "/"],
    ["dashboard", "/dashboard?environment=moon"],
    ["explorer", "/investigations"],
    ["compare", "/compare"],
    ["assistant", "/assistant"],
    ["safety-tech", "/safety-tech"],
    ["earth-applications", "/earth-applications"],
    ["data-gaps", "/data-gaps"],
    ["methodology", "/methodology"],
    ["detail", "/investigations/PSI-22"],
  ] as const;
  for (const viewport of [{ width: 320, height: 720 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const [name, route] of routes) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator("main")).toBeVisible();
      if (viewport.width <= 760 && ["safety-tech", "earth-applications", "data-gaps", "methodology"].includes(name)) {
        await expect(page.locator(".mobile-more")).toHaveClass(/has-active/);
      }
      if ((viewport.width === 375 || viewport.width === 768) && ["home", "dashboard", "explorer", "compare", "assistant", "detail", "safety-tech", "earth-applications", "data-gaps", "methodology"].includes(name)) {
        await page.screenshot({ path: `test-results/layout-review-${viewport.width}-${name}.png` });
      }
      const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        offenders: [...document.querySelectorAll("body *")].map((element) => {
          const bounds = element.getBoundingClientRect();
          return { tag: element.tagName, className: typeof element.className === "string" ? element.className : "", right: Math.round(bounds.right), width: Math.round(bounds.width) };
        }).filter((element) => element.right > window.innerWidth + 1).slice(0, 8),
      }));
      expect(widths.document, `${route} at ${viewport.width}px overflows: ${JSON.stringify(widths.offenders)}`).toBeLessThanOrEqual(widths.viewport);
    }
    if (viewport.width <= 760) {
      await expect(page.locator(".sidebar")).toHaveCSS("position", "fixed");
      const layout = await page.evaluate(() => ({
        contentBottom: document.querySelector(".main-column")!.getBoundingClientRect().bottom,
        navigationTop: document.querySelector(".sidebar")!.getBoundingClientRect().top,
      }));
      expect(layout.contentBottom, "mobile page content must end above the bottom navigation").toBeLessThanOrEqual(layout.navigationTop + 1);
      await page.locator(".mobile-more summary").click();
      for (const name of ["Safety technology", "Earth applications", "Data gaps", "Methodology"]) {
        await expect(page.locator(".mobile-more-menu").getByRole("link", { name })).toBeVisible();
      }
    } else {
      await expect(page.locator('aside[aria-label="Primary navigation"]').getByRole("link", { name: "Mission dashboard" })).toBeVisible();
    }
  }
});
