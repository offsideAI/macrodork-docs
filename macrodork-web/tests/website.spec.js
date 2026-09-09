import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";
const evidence = resolve("../Mark-I-Build/website");
for (const width of [320, 768, 1024, 1440]) {
  test(`layout, assets and accessibility at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A new kindof company.",
    );
    await expect(
      page.getByText("No payment is being collected."),
    ).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const img of document.images) {
        img.loading = "eager";
        await img.decode().catch(() => {});
      }
    });
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.every((img) => img.complete && img.naturalWidth > 0),
        ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    if (width === 1440 || width === 320)
      await page.screenshot({
        path: `${evidence}/mark-1-website-${width}.png`,
        fullPage: true,
      });
  });
}
test("mobile menu, keyboard access, gallery and FAQ work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Skip to content")).toBeFocused();
  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.getByRole("link", { name: "Design", exact: true }).click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Rear" }).click();
  await expect(page.getByRole("button", { name: "Rear" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".gallery-image img")).toHaveAttribute(
    "src",
    "/images/mark-1/rear.png",
  );
  await page.locator(".faq summary").first().click();
  await expect(page.locator(".faq details").first()).toHaveAttribute(
    "open",
    "",
  );
});
test("offer error can recover to the closed state", async ({ page }) => {
  let count = 0;
  await page.route("**/api/preorder", (route) =>
    route.fulfill({
      status: count++ ? 200 : 503,
      json: count > 1 ? { enabled: false } : { error: "unavailable" },
    }),
  );
  await page.goto("/#preorder");
  await expect(
    page.getByRole("heading", { name: "Let’s reconnect." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText("No payment is being collected.")).toBeVisible();
});
const offer = {
  enabled: true,
  amount: 10000,
  currency: "cad",
  testMode: true,
  mode: "deposit",
  termsVersion: "fixture-v1",
  terms: "Fixture preorder terms.",
  refundPolicy: "Fixture refunds.",
  deliveryEstimate: "Fixture date not set.",
  balanceStatement: "Fixture balance TBD.",
  merchantName: "Test merchant",
  privacyNotice: "Fixture privacy notice.",
  supportEmail: "test@example.com",
  countries: ["CA"],
};
test("enabled test offer requires consent and handles checkout failure without false confirmation", async ({
  page,
}) => {
  await page.route("**/api/preorder", (route) =>
    route.fulfill({ json: offer }),
  );
  let sent;
  await page.route("**/api/checkout", (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({
      status: 503,
      json: { error: "Checkout could not be opened. Please try again." },
    });
  });
  await page.goto("/#preorder");
  const button = page.getByRole("button", {
    name: "Continue to test checkout",
  });
  await expect(button).toBeDisabled();
  await page.getByText("Read preorder & privacy terms").click();
  await expect(page.getByText("Fixture refunds.")).toBeVisible();
  await page.getByRole("checkbox").check();
  await button.click();
  await expect(page.getByRole("alert")).toContainText(
    "Checkout could not be opened",
  );
  expect(sent.accepted).toBe(true);
  expect(sent.termsVersion).toBe("fixture-v1");
  expect(sent.amount).toBeUndefined();
  await expect(button).toBeEnabled();
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.screenshot({ path: `${evidence}/mark-1-test-preorder.png` });
});
test("success URL alone never confirms payment; verified status does", async ({
  page,
}) => {
  let status = "pending";
  await page.route("**/api/checkout/status?**", (route) =>
    route.fulfill({ json: { ...offer, status } }),
  );
  await page.goto(
    "/?checkout=success&session_id=cs_test_fixture&token=fixture",
  );
  await expect(
    page.getByRole("heading", { name: "Checking your payment…" }),
  ).toBeVisible();
  expect(page.url()).not.toContain("token=");
  status = "paid";
  await expect(
    page.getByRole("heading", { name: "Test payment confirmed." }),
  ).toBeVisible({ timeout: 10000 });
});
test("cancel return clearly reports no confirmed order", async ({ page }) => {
  await page.goto("/?checkout=cancelled");
  await expect(
    page.getByRole("heading", { name: "Checkout closed." }),
  ).toBeVisible();
  await expect(
    page.getByText("No order is confirmed here.", { exact: false }),
  ).toBeVisible();
});
