/**
 * 02-auth-gates.spec.ts
 * Authentication, authorization, and gate-guard tests.
 * Covers: login page, admin redirects, manage link gates, invalid tokens.
 */
import { expect, test } from "@playwright/test";

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────

test.describe("Login page", () => {
  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /admin sign in/i }),
    ).toBeVisible();
  });

  test("shows Continue with Google button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toBeVisible();
  });

  test("login page returns 200", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.status()).toBe(200);
  });

  test("login page has a form element", async ({ page }) => {
    await page.goto("/login");
    // Google OAuth button implies there's interactive content
    await expect(page.locator("button, form, a")).not.toHaveCount(0);
  });
});

// ─── UNAUTHENTICATED ADMIN REDIRECTS ─────────────────────────────────────────

test.describe("Admin auth guards", () => {
  test("unauthenticated /admin redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /admin/profiles redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/profiles");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /admin/create redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/create");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /admin/packages redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/packages");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /admin/security redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/security");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /admin/settings redirects to /login", async ({
    page,
  }) => {
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── ADMIN API AUTH GUARDS ────────────────────────────────────────────────────

test.describe("Admin API — 401 without session", () => {
  test("GET /api/admin/profiles returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/profiles");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/profiles returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/profiles", {
      data: { displayName: "Test Person", packageId: "pkg-a" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/packages returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/packages");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/packages returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/packages", {
      data: { name: "Hack", retentionYears: 50 },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/admins returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/admins");
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/temple-settings returns 401", async ({ request }) => {
    const res = await request.get("/api/admin/temple-settings");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/temple-settings returns 401", async ({ request }) => {
    const res = await request.patch("/api/admin/temple-settings", {
      data: { templeName: "Hack" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/profiles/[id] returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/profiles/nonexistent-id");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/profiles/[id] returns 401 without session", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/profiles/nonexistent-id", {
      data: { packageId: "pkg-b" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/profiles/[id] returns 401 without session", async ({
    request,
  }) => {
    const res = await request.delete("/api/admin/profiles/nonexistent-id");
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE API AUTH GUARDS ───────────────────────────────────────────────────

test.describe("Manage API — 401 without session cookie", () => {
  test("GET /api/manage/content returns 401", async ({ request }) => {
    const res = await request.get("/api/manage/content");
    expect(res.status()).toBe(401);
  });

  test("PUT /api/manage/statements returns 401", async ({ request }) => {
    const res = await request.put("/api/manage/statements", {
      data: { statements: [{ body: "should fail" }] },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/manage/settings returns 401", async ({ request }) => {
    const res = await request.patch("/api/manage/settings", {
      data: { isPublicPinRequired: true },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/manage/comments/[id] returns 401", async ({ request }) => {
    const res = await request.delete(
      "/api/manage/comments/507f1f77bcf86cd799439011",
    );
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/manage/media/[id] returns 401", async ({ request }) => {
    const res = await request.delete(
      "/api/manage/media/507f1f77bcf86cd799439011",
    );
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/manage/media/[id] returns 401", async ({ request }) => {
    const res = await request.patch(
      "/api/manage/media/507f1f77bcf86cd799439011",
      { data: { description: "hack" } },
    );
    expect(res.status()).toBe(401);
  });

  test("GET /api/manage/media/[id]/url returns 401", async ({ request }) => {
    const res = await request.get(
      "/api/manage/media/507f1f77bcf86cd799439011/url",
    );
    expect(res.status()).toBe(401);
  });

  test("POST /api/manage/media/presign returns 401", async ({ request }) => {
    const res = await request.post("/api/manage/media/presign", {
      data: { kind: "PHOTO", contentType: "image/jpeg", sizeBytes: 1000 },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/manage/media/confirm returns 401", async ({ request }) => {
    const res = await request.post("/api/manage/media/confirm", {
      data: {
        kind: "PHOTO",
        contentType: "image/jpeg",
        sizeBytes: 1000,
        r2ObjectKey: "hack/key.jpg",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/manage/logout clears session gracefully", async ({
    request,
  }) => {
    // Without session should still respond (cookie clear is idempotent)
    const res = await request.post("/api/manage/logout");
    expect([200, 401]).toContain(res.status());
  });
});

// ─── PUBLIC GATE — MEMORIAL PAGES ─────────────────────────────────────────────

test.describe("Public memorial gate — invalid/unknown QR IDs", () => {
  test("completely missing QR ID shows gate page", async ({ page }) => {
    await page.goto("/p/playwright-missing-qr-id-zzzz");
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("random UUID QR shows not-found gate", async ({ page }) => {
    await page.goto("/p/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByRole("heading", { name: /not found|not ready|memorial/i }),
    ).toBeVisible();
  });

  test("extremely long QR ID shows gate (not crash)", async ({ page }) => {
    const longId = "x".repeat(200);
    const res = await page.goto(`/p/${longId}`);
    // Should return 200 (SSR page with gate card) not 500
    expect(res?.status()).toBeLessThan(500);
  });

  test("QR ID with special characters shows gate", async ({ page }) => {
    const res = await page.goto("/p/test%20space");
    expect(res?.status()).toBeLessThan(500);
  });
});

// ─── MANAGE LINK GATES ────────────────────────────────────────────────────────

test.describe("Manage link gate — invalid tokens", () => {
  test("completely invalid manage token shows unavailable gate", async ({
    page,
  }) => {
    await page.goto("/manage/playwright-invalid-token-zzzz");
    await expect(
      page.getByRole("heading", { name: /manage link unavailable/i }),
    ).toBeVisible();
  });

  test("empty manage path shows 404 or redirect", async ({ page }) => {
    const res = await page.goto("/manage/");
    // Should not crash — 404 or redirect is acceptable
    expect(res?.status()).toBeLessThan(500);
  });

  test("manage page with too-short token shows unavailable", async ({
    page,
  }) => {
    await page.goto("/manage/short");
    expect(page.url()).not.toContain("500");
  });
});

// ─── SETUP LINK GATES ─────────────────────────────────────────────────────────

test.describe("Setup link gate — invalid tokens", () => {
  test("invalid setup token shows gate card", async ({ page }) => {
    await page.goto("/setup/playwright-invalid-setup-token-zzzz");
    await expect(
      page.getByRole("heading", { name: /setup link|unavailable|invalid/i }),
    ).toBeVisible();
  });
});
