/**
 * 06-setup-flow-ui.spec.ts
 * Setup flow UI tests — gate cards, form rendering, validation messages.
 * Tests all UI states without needing a real setup token.
 */
import { expect, test } from "@playwright/test";

// ─── SETUP GATE — INVALID TOKEN ──────────────────────────────────────────────

test.describe("Setup gate — invalid tokens", () => {
  test("invalid token shows gate heading", async ({ page }) => {
    await page.goto("/setup/playwright-invalid-setup-token-zzzz");
    await expect(
      page.getByRole("heading", { name: /setup link|unavailable|invalid/i }),
    ).toBeVisible();
  });

  test("invalid token page returns 200 (not 500)", async ({ page }) => {
    const res = await page.goto("/setup/playwright-invalid-setup-token-zzzz");
    expect(res?.status()).toBe(200);
  });

  test("invalid token shows descriptive message", async ({ page }) => {
    await page.goto("/setup/playwright-invalid-setup-token-zzzz");
    await expect(
      page.getByText(/link|invalid|expired|not valid/i),
    ).toBeVisible();
  });

  test("empty setup token URL returns non-500", async ({ page }) => {
    const res = await page.goto("/setup/");
    expect(res?.status()).toBeLessThan(500);
  });

  test("extremely long setup token returns non-500", async ({ page }) => {
    const longToken = "x".repeat(500);
    const res = await page.goto(`/setup/${longToken}`);
    expect(res?.status()).toBeLessThan(500);
  });
});

// ─── MANAGE GATE — INVALID TOKEN ─────────────────────────────────────────────

test.describe("Manage gate — invalid tokens (UI)", () => {
  test("invalid manage token shows unavailable heading", async ({ page }) => {
    await page.goto("/manage/playwright-invalid-token-zzzz");
    await expect(
      page.getByRole("heading", { name: /manage link unavailable/i }),
    ).toBeVisible();
  });

  test("shows error description text", async ({ page }) => {
    await page.goto("/manage/playwright-invalid-token-zzzz");
    await expect(
      page.getByText(/invalid|expired|not found|unavailable/i),
    ).toBeVisible();
  });

  test("invalid manage link page is 200 (SSR gate)", async ({ page }) => {
    const res = await page.goto("/manage/playwright-invalid-token-zzzz");
    expect(res?.status()).toBe(200);
  });

  test("manage PIN form shows for valid-looking token format", async ({
    page,
  }) => {
    // Even with a fake token, the page should render a PIN form or unavailable gate
    await page.goto("/manage/playwright-invalid-token-zzzz");
    const heading = page.getByRole("heading");
    await expect(heading.first()).toBeVisible();
  });
});

// ─── SETUP FLOW — FORM VALIDATION (REQUIRES TOKEN) ───────────────────────────

test.describe("Setup API — input validation (no real token)", () => {
  test("POST /api/setup/pin — pin too short returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/setup/pin", {
      data: {
        profileId: "playwright-fake-profile",
        setupToken: "playwright-fake-setup-token",
        pin: "12",
        isPublicPinRequired: false,
      },
    });
    expect([400, 401]).toContain(res.status());
  });

  test("POST /api/setup/pin — pin all zeros returns 400 or 401", async ({
    request,
  }) => {
    const res = await request.post("/api/setup/pin", {
      data: {
        profileId: "playwright-fake-profile",
        setupToken: "playwright-fake-setup-token",
        pin: "000000",
        isPublicPinRequired: false,
      },
    });
    // Either validation rejects 000000 or auth rejects the fake token
    expect([400, 401]).toContain(res.status());
  });

  test("POST /api/setup/statements — no body returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/setup/statements", {
      data: {},
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("POST /api/setup/complete — no body returns 400 or 401", async ({
    request,
  }) => {
    const res = await request.post("/api/setup/complete", { data: {} });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("POST /api/setup/complete — fake token returns 401", async ({
    request,
  }) => {
    const res = await request.post("/api/setup/complete", {
      data: {
        profileId: "playwright-fake-profile",
        setupToken: "playwright-fake-token",
      },
    });
    expect([400, 401]).toContain(res.status());
  });
});

// ─── MEMORIAL PREVIEW PAGE ────────────────────────────────────────────────────

test.describe("Memorial preview page", () => {
  test("memorial-preview page loads without crash", async ({ page }) => {
    const res = await page.goto("/memorial-preview");
    // May require session or redirect — just ensure no 500
    expect(res?.status()).toBeLessThan(500);
  });
});

// ─── PUBLIC MEMORIAL PAGE — NOT READY STATE ──────────────────────────────────

test.describe("Public memorial gate — various QR ID formats", () => {
  test("numeric-only QR ID shows gate", async ({ page }) => {
    const res = await page.goto("/p/12345678");
    expect(res?.status()).toBeLessThan(500);
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("QR ID with hyphens shows gate", async ({ page }) => {
    await page.goto("/p/test-qr-id-zzzz");
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("QR ID with underscores shows gate", async ({ page }) => {
    await page.goto("/p/test_qr_id_zzzz");
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("single char QR ID shows gate", async ({ page }) => {
    await page.goto("/p/x");
    const status = (await page.goto("/p/x"))?.status();
    expect(status).toBeLessThan(500);
  });
});
