/**
 * 05-admin-api.spec.ts
 * Admin API — unauthenticated / malformed request tests.
 * Tests all admin endpoints for proper auth rejection and validation.
 */
import { expect, test } from "@playwright/test";

// ─── ADMIN PROFILES ───────────────────────────────────────────────────────────

test.describe("Admin Profiles API — validation (no auth)", () => {
  test("POST /api/admin/profiles — 401 without session", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/profiles", {
      data: { displayName: "Test Memorial", packageId: "pkg-a" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/profiles — 401 with empty body", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/profiles", { data: {} });
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/profiles — 401 without session", async ({ request }) => {
    const res = await request.get("/api/admin/profiles");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/profiles/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/profiles/fake-id", {
      data: { packageId: "pkg-b" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/profiles/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.delete("/api/admin/profiles/fake-id");
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/profiles/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/profiles/fake-id");
    expect(res.status()).toBe(401);
  });
});

// ─── ADMIN PACKAGES ───────────────────────────────────────────────────────────

test.describe("Admin Packages API — validation (no auth)", () => {
  test("GET /api/admin/packages — 401 without session", async ({ request }) => {
    const res = await request.get("/api/admin/packages");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/packages — 401 without session", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/packages", {
      data: {
        name: "Test Package",
        retentionYears: 25,
        features: ["Feature 1"],
      },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/packages/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/packages/fake-id");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/packages/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/packages/fake-id", {
      data: { name: "Updated Name" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/packages/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.delete("/api/admin/packages/fake-id");
    expect(res.status()).toBe(401);
  });
});

// ─── ADMIN ADMINS ─────────────────────────────────────────────────────────────

test.describe("Admin Admins API — validation (no auth)", () => {
  test("GET /api/admin/admins — 401 without session", async ({ request }) => {
    const res = await request.get("/api/admin/admins");
    expect(res.status()).toBe(401);
  });

  test("POST /api/admin/admins — 401 without session", async ({ request }) => {
    const res = await request.post("/api/admin/admins", {
      data: { email: "hack@example.com" },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/admin/admins/[id] — 401 without session", async ({
    request,
  }) => {
    const res = await request.delete("/api/admin/admins/fake-id");
    expect(res.status()).toBe(401);
  });
});

// ─── ADMIN TEMPLE SETTINGS ────────────────────────────────────────────────────

test.describe("Admin Temple Settings API — validation (no auth)", () => {
  test("GET /api/admin/temple-settings — 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/temple-settings");
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/temple-settings — 401 without session", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/temple-settings", {
      data: { templeName: "Hacked Temple" },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/admin/temple-settings — 401 with empty body", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/temple-settings", {
      data: {},
    });
    expect(res.status()).toBe(401);
  });
});

// ─── ADMIN PAGE GUARDS ────────────────────────────────────────────────────────

test.describe("Admin page UI guards — unauthenticated browser", () => {
  test("/admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/profiles redirects to login", async ({ page }) => {
    await page.goto("/admin/profiles");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/profiles/[id] redirects to login", async ({ page }) => {
    await page.goto("/admin/profiles/playwright-fake-id");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/create redirects to login", async ({ page }) => {
    await page.goto("/admin/create");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/packages redirects to login", async ({ page }) => {
    await page.goto("/admin/packages");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/security redirects to login", async ({ page }) => {
    await page.goto("/admin/security");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/admin/settings redirects to login", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── RESPONSE FORMAT CHECKS ──────────────────────────────────────────────────

test.describe("Admin API — response format consistency", () => {
  test("401 response from profiles has JSON content-type", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/profiles");
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });

  test("401 response from packages has JSON content-type", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/packages");
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });

  test("401 response body has error field", async ({ request }) => {
    const res = await request.get("/api/admin/profiles");
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBeTruthy();
  });

  test("401 response from admins has JSON content-type", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/admins");
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });
});
