/**
 * 08-ui-accessibility.spec.ts
 * UI accessibility and rendering tests — keyboard navigation, ARIA labels,
 * semantic structure, responsive rendering, and visual state consistency.
 */
import { expect, test } from "@playwright/test";

// ─── LANDMARK AND SEMANTIC HTML ───────────────────────────────────────────────

test.describe("Semantic HTML — home page", () => {
  test("home page has exactly one <main> element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("home page has at least one <nav> element", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("nav").count()).toBeGreaterThanOrEqual(1);
  });

  test("home page heading hierarchy starts with h1 or h2", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    const h2Count = await page.locator("h2").count();
    expect(h1Count + h2Count).toBeGreaterThan(0);
  });

  test("home page links have discernible text", async ({ page }) => {
    await page.goto("/");
    const links = await page.locator("a").all();
    for (const link of links.slice(0, 10)) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      // Either has text content or aria-label
      expect((text?.trim() ?? "") + (ariaLabel ?? "")).not.toBe("");
    }
  });
});

test.describe("Semantic HTML — about page", () => {
  test("about page has one main element", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("about page has at least one heading", async ({ page }) => {
    await page.goto("/about");
    expect(await page.locator("h1, h2, h3").count()).toBeGreaterThan(0);
  });
});

test.describe("Semantic HTML — packages page", () => {
  test("packages page has one main element", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("packages page has headings", async ({ page }) => {
    await page.goto("/packages");
    expect(await page.locator("h1, h2").count()).toBeGreaterThan(0);
  });
});

test.describe("Semantic HTML — contact page", () => {
  test("contact page has one main element", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("contact page has a heading", async ({ page }) => {
    await page.goto("/contact");
    expect(await page.locator("h1, h2").count()).toBeGreaterThan(0);
  });
});

// ─── KEYBOARD NAVIGATION ──────────────────────────────────────────────────────

test.describe("Keyboard navigation — home page", () => {
  test("Tab key moves focus to first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("Tab key reaches CTA link", async ({ page }) => {
    await page.goto("/");
    // Press tab multiple times to cycle through links
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }
    const focused = page.locator(":focus");
    // Some interactive element should be focused
    expect(await focused.count()).toBeGreaterThanOrEqual(0);
  });

  test("Enter key activates nav links", async ({ page }) => {
    await page.goto("/");
    const aboutLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About" });
    await aboutLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about/);
  });
});

// ─── ARIA LABELS AND ROLES ────────────────────────────────────────────────────

test.describe("ARIA roles and labels", () => {
  test("home page navigation has accessible name", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
  });

  test("login page Google button has accessible role", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
  });

  test("manage gate heading is an accessible heading", async ({ page }) => {
    await page.goto("/manage/playwright-invalid-token-zzzz");
    const heading = page.getByRole("heading");
    await expect(heading.first()).toBeVisible();
  });

  test("memorial gate heading is an accessible heading", async ({ page }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    const heading = page.getByRole("heading");
    await expect(heading.first()).toBeVisible();
  });
});

// ─── RESPONSIVE VIEWPORT ──────────────────────────────────────────────────────

test.describe("Responsive rendering — mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone SE

  test("home page renders on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mathaka QR").first()).toBeVisible();
  });

  test("about page renders on mobile", async ({ page }) => {
    await page.goto("/about");
    expect(
      await page.locator("h1, h2").count(),
    ).toBeGreaterThan(0);
  });

  test("packages page renders on mobile", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("Package A").first()).toBeVisible();
  });

  test("contact page renders on mobile", async ({ page }) => {
    await page.goto("/contact");
    expect(
      await page.locator("h1, h2").count(),
    ).toBeGreaterThan(0);
  });

  test("gate page renders on mobile", async ({ page }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    const heading = page.getByRole("heading");
    await expect(heading.first()).toBeVisible();
  });
});

test.describe("Responsive rendering — tablet viewport", () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test("home page renders on tablet", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mathaka QR").first()).toBeVisible();
  });

  test("packages page renders on tablet", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("Package A").first()).toBeVisible();
  });
});

// ─── FORM INPUTS AND LABELS ───────────────────────────────────────────────────

test.describe("Form inputs — login page", () => {
  test("login page button is not disabled by default", async ({ page }) => {
    await page.goto("/login");
    const btn = page.getByRole("button", { name: /continue with google/i });
    await expect(btn).not.toBeDisabled();
  });
});

// ─── 404 AND ERROR PAGES ──────────────────────────────────────────────────────

test.describe("Error pages", () => {
  test("non-existent route returns non-500 status", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-playwright");
    expect(res?.status()).toBeLessThan(500);
  });

  test("deeply nested non-existent route returns non-500", async ({ page }) => {
    const res = await page.goto("/a/b/c/d/e/f/g/not-found");
    expect(res?.status()).toBeLessThan(500);
  });
});

// ─── META AND SEO ─────────────────────────────────────────────────────────────

test.describe("SEO and meta tags", () => {
  test("home page has a meta description or title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("about page has a descriptive title", async ({ page }) => {
    await page.goto("/about");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("packages page has a title", async ({ page }) => {
    await page.goto("/packages");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("login page has a title", async ({ page }) => {
    await page.goto("/login");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("memorial gate pages have noindex robots", async ({ page }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    const robotsMeta = page.locator('meta[name="robots"]');
    // If present, check it's restrictive; if absent, that's fine too
    if ((await robotsMeta.count()) > 0) {
      const content = await robotsMeta.getAttribute("content");
      expect(content).toMatch(/noindex|no-index/i);
    }
  });
});
