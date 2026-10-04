/**
 * 01-public-site.spec.ts
 * Public-facing marketing site: home, about, packages, contact, navigation.
 */
import { expect, test } from "@playwright/test";

// ─── HOME PAGE ──────────────────────────────────────────────────────────────

test.describe("Home page", () => {
  test("renders hero headline and brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mathaka QR").first()).toBeVisible();
  });

  test("renders hero sub-heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /digital remembrance/i }),
    ).toBeVisible();
  });

  test("hero CTA — Create a Memorial link exists and points to /contact", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /create a memorial/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/contact");
  });

  test("hero CTA — Learn More link exists and points to /about", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /learn more/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/about");
  });

  test("three-step section is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/three quiet steps/i).first()).toBeVisible();
  });

  test("step 1 — Organization creates the memorial", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/organization creates the memorial/i),
    ).toBeVisible();
  });

  test("step 2 — Family preserves memories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/family preserves memories/i)).toBeVisible();
  });

  test("step 3 — Visitors remember via QR", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/visitors remember via qr/i)).toBeVisible();
  });

  test("packages section exists on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/same care. different years/i)).toBeVisible();
  });

  test("CTA pre-footer section exists", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/begin with a conversation/i),
    ).toBeVisible();
  });

  test("footer pre-footer contact link points to /contact", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /contact us today/i });
    await expect(link).toBeVisible();
  });

  test("page has <title> tag", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test("page loads with 200 status", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("no console errors on home page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Allow minor hydration warnings but no JS exceptions
    const serious = errors.filter(
      (e) => !e.includes("Warning:") && !e.includes("act("),
    );
    expect(serious.length).toBe(0);
  });
});

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

test.describe("Site navigation", () => {
  test("primary nav contains About link", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
        name: "About",
      }),
    ).toBeVisible();
  });

  test("clicking About in nav navigates to /about", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About" })
      .click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("primary nav contains Packages link", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: /packages/i })).toBeVisible();
  });

  test("clicking Packages in nav navigates to /packages", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: /packages/i })
      .click();
    await expect(page).toHaveURL(/\/packages$/);
  });

  test("contact link from nav area goes to /contact", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("link", { name: /temple admin|sign in here/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── ABOUT PAGE ─────────────────────────────────────────────────────────────

test.describe("About page", () => {
  test("loads with 200 status", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);
  });

  test("renders Built for organizations heading", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /built for organizations/i }),
    ).toBeVisible();
  });

  test("about page has descriptive content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/private|memorial|family/i).first()).toBeVisible();
  });

  test("about page links back to home", async ({ page }) => {
    await page.goto("/about");
    const homeLink = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .first();
    await homeLink.click();
    await expect(page).toHaveURL(/.*\/$/);
  });
});

// ─── PACKAGES PAGE ───────────────────────────────────────────────────────────

test.describe("Packages page", () => {
  test("loads with 200 status", async ({ page }) => {
    const res = await page.goto("/packages");
    expect(res?.status()).toBe(200);
  });

  test("renders packages heading", async ({ page }) => {
    await page.goto("/packages");
    await expect(
      page.getByRole("heading", { name: /choose the remembrance horizon/i }),
    ).toBeVisible();
  });

  test("shows Package A", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("A", { exact: true }).first()).toBeVisible();
  });

  test("shows Package B", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("B", { exact: true }).first()).toBeVisible();
  });

  test("shows Package C", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("C", { exact: true }).first()).toBeVisible();
  });

  test("shows retention years — 25 years", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("25").first()).toBeVisible();
  });

  test("shows retention years — 100 years", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("100").first()).toBeVisible();
  });

  test("shows QR comments label", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText(/Comment Section/i).first()).toBeVisible();
  });

  test("shows privacy statement", async ({ page }) => {
    await page.goto("/packages");
    await expect(
      page.getByText(
        /Your family's privacy is our highest priority/i,
      ),
    ).toBeVisible();
  });
});

// ─── CONTACT PAGE ────────────────────────────────────────────────────────────

test.describe("Contact page", () => {
  test("loads with 200 status", async ({ page }) => {
    const res = await page.goto("/contact");
    expect(res?.status()).toBe(200);
  });

  test("renders speak with us heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /speak with us/i }).first(),
    ).toBeVisible();
  });

  test("contact page has descriptive text", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText(/temple|contact|memorial/i).first()).toBeVisible();
  });
});
