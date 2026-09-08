import { expect, test } from "@playwright/test";

test.describe("Sohona public site smoke", () => {
  test("home shows Sohona brand and primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sohona").first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /quiet digital memorial/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /learn about sohona/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /contact the temple/i }),
    ).toBeVisible();
  });

  test("about / packages / contact pages load", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /built for temples/i }),
    ).toBeVisible();

    await page.goto("/packages");
    await expect(
      page.getByRole("heading", { name: /simple offerings/i }),
    ).toBeVisible();
    await expect(page.getByText("Remembrance")).toBeVisible();

    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /speak with the temple/i }),
    ).toBeVisible();
  });

  test("site nav reaches about and temple admin login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", {
      name: "About",
    }).click();
    await expect(page).toHaveURL(/\/about$/);

    await page.goto("/contact");
    await page.getByRole("link", { name: /temple admin|sign in here/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Auth and memorial gates", () => {
  test("login page is reachable without session", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /admin sign in/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
  });

  test("unauthenticated /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.url()).toMatch(/error=Unauthorized|callbackUrl/);
  });

  test("unknown public memorial shows not-found style gate", async ({
    page,
  }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("invalid manage link shows unavailable gate", async ({ page }) => {
    await page.goto("/manage/playwright-invalid-token-zzzz");
    await expect(
      page.getByRole("heading", { name: /manage link unavailable/i }),
    ).toBeVisible();
  });

  test("manage APIs reject without session cookie", async ({ request }) => {
    const content = await request.get("/api/manage/content");
    expect(content.status()).toBe(401);

    const statements = await request.put("/api/manage/statements", {
      data: { statements: [{ body: "should fail" }] },
    });
    expect(statements.status()).toBe(401);

    const settings = await request.patch("/api/manage/settings", {
      data: { isPublicPinRequired: true },
    });
    expect(settings.status()).toBe(401);
  });

  test("admin API rejects without session", async ({ request }) => {
    const response = await request.get("/api/admin/profiles");
    expect(response.status()).toBe(401);
  });
});
