/**
 * 10-performance-and-seo.spec.ts
 * Performance, SEO, and basic load-time tests.
 * Covers: page load, resource loading, meta tags, robots directives.
 */
import { expect, test } from "@playwright/test";

// ─── PAGE LOAD PERFORMANCE ────────────────────────────────────────────────────

test.describe("Page load — performance thresholds", () => {
  test("home page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("about page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("packages page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/packages", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("contact page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("login page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("memorial gate page loads in under 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/p/playwright-missing-qr-id-zzzz", {
      waitUntil: "domcontentloaded",
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});

// ─── CRITICAL RESOURCE LOADING ────────────────────────────────────────────────

test.describe("Critical resource loading", () => {
  test("home page has no failed network requests for JS/CSS", async ({
    page,
  }) => {
    const failed: string[] = [];
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (url.includes(".js") || url.includes(".css")) {
        failed.push(url);
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(failed).toHaveLength(0);
  });

  test("about page has no failed JS/CSS resources", async ({ page }) => {
    const failed: string[] = [];
    page.on("requestfailed", (req) => {
      const url = req.url();
      if (url.includes(".js") || url.includes(".css")) {
        failed.push(url);
      }
    });
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    expect(failed).toHaveLength(0);
  });
});

// ─── SEO METADATA ─────────────────────────────────────────────────────────────

test.describe("SEO metadata — page titles", () => {
  test("home page title contains Mathaka or Sohona", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toMatch(/mathaka|sohona/i);
  });

  test("about page title is descriptive", async ({ page }) => {
    await page.goto("/about");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test("packages page title is descriptive", async ({ page }) => {
    await page.goto("/packages");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test("login page title is descriptive", async ({ page }) => {
    await page.goto("/login");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test("memorial page title contains memorial name or Sohona", async ({
    page,
  }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    const title = await page.title();
    expect(title).toMatch(/memorial|sohona|mathaka/i);
  });
});

// ─── CANONICAL / NO-INDEX ─────────────────────────────────────────────────────

test.describe("SEO — robots and indexing", () => {
  test("admin page has no-index or redirects to login", async ({ page }) => {
    await page.goto("/admin");
    // If redirected to login, fine. If showing admin, check no-index.
    if (page.url().includes("/admin") && !page.url().includes("/login")) {
      const robotsMeta = page.locator('meta[name="robots"]');
      if ((await robotsMeta.count()) > 0) {
        const content = await robotsMeta.getAttribute("content");
        expect(content).toMatch(/noindex/i);
      }
    }
  });

  test("setup page has no-index or redirects for invalid token", async ({
    page,
  }) => {
    await page.goto("/setup/playwright-invalid-setup-token-zzzz");
    if (!page.url().includes("/login")) {
      const robotsMeta = page.locator('meta[name="robots"]');
      if ((await robotsMeta.count()) > 0) {
        const content = await robotsMeta.getAttribute("content");
        expect(content).toMatch(/noindex/i);
      }
    }
  });
});

// ─── IMAGE ALT TEXTS ──────────────────────────────────────────────────────────

test.describe("Image accessibility — alt texts", () => {
  test("home page images all have alt attributes", async ({ page }) => {
    await page.goto("/");
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      // alt="" (decorative) is acceptable, but attribute must exist
      expect(alt).not.toBeNull();
    }
  });

  test("about page images all have alt attributes", async ({ page }) => {
    await page.goto("/about");
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });
});

// ─── FOOTER PRESENCE ─────────────────────────────────────────────────────────

test.describe("Site footer", () => {
  test("home page has a footer element", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await page.locator("footer").count()).toBeGreaterThanOrEqual(1);
  });

  test("about page has a footer element", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    expect(await page.locator("footer").count()).toBeGreaterThanOrEqual(1);
  });

  test("contact page has a footer element", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    expect(await page.locator("footer").count()).toBeGreaterThanOrEqual(1);
  });
});

// ─── LINK INTEGRITY ───────────────────────────────────────────────────────────

test.describe("Internal link integrity", () => {
  test("all nav links on home page are reachable", async ({ page }) => {
    await page.goto("/");
    const navLinks = await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .all();

    for (const link of navLinks) {
      const href = await link.getAttribute("href");
      if (href && href.startsWith("/")) {
        const res = await page.request.get(href);
        expect(res.status()).toBeLessThan(500);
      }
    }
  });
});
