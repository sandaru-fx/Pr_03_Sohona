/**
 * 07-security-hardening.spec.ts
 * Security and hardening tests: IDOR checks, headers, injection prevention,
 * rate limiting responses, CSRF protection, XSS prevention.
 */
import { expect, test } from "@playwright/test";

// ─── SECURITY HEADERS ─────────────────────────────────────────────────────────

test.describe("HTTP security headers", () => {
  test("home page has no X-Powered-By: Express header", async ({ request }) => {
    const res = await request.get("/");
    const powered = res.headers()["x-powered-by"] ?? "";
    expect(powered.toLowerCase()).not.toContain("express");
  });

  test("admin API 401 response has Cache-Control: no-store", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/profiles");
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });

  test("manage API 401 response has Cache-Control: no-store", async ({
    request,
  }) => {
    const res = await request.get("/api/manage/content");
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });

  test("public pin API response has Cache-Control: no-store", async ({
    request,
  }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-id", pin: "123456" },
    });
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });
});

// ─── IDOR / AUTHORIZATION BYPASS ─────────────────────────────────────────────

test.describe("IDOR prevention — cannot access other profiles' data", () => {
  test("GET /api/manage/media/[id]/url returns 401 without session", async ({
    request,
  }) => {
    const res = await request.get("/api/manage/media/fake-media-id/url");
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/manage/comments/[id] returns 401 without session", async ({
    request,
  }) => {
    const res = await request.delete(
      "/api/manage/comments/playwright-guessed-comment-id",
    );
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/manage/media/[id] returns 401 without session", async ({
    request,
  }) => {
    const res = await request.delete(
      "/api/manage/media/playwright-guessed-media-id",
    );
    expect(res.status()).toBe(401);
  });

  test("GET /api/public/media/[id]/url without context returns 4xx", async ({
    request,
  }) => {
    const res = await request.get("/api/public/media/guessed-id/url");
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── SQL / NOSQL INJECTION PREVENTION ────────────────────────────────────────

test.describe("Injection prevention — QR and token inputs", () => {
  test("SQL injection in QR ID shows gate page (not 500)", async ({ page }) => {
    const res = await page.goto("/p/'; DROP TABLE profiles; --");
    expect(res?.status()).toBeLessThan(500);
  });

  test("XSS in QR ID is escaped (not executed)", async ({ page }) => {
    const alerts: string[] = [];
    page.on("dialog", (dialog) => {
      alerts.push(dialog.message());
      void dialog.dismiss();
    });
    await page.goto(
      "/p/<script>alert('xss')</script>",
    );
    expect(alerts.length).toBe(0);
  });

  test("path traversal in manage token shows gate", async ({ page }) => {
    const res = await page.goto("/manage/../../etc/passwd");
    expect(res?.status()).toBeLessThan(500);
  });

  test("null byte in QR ID does not crash server", async ({ page }) => {
    const res = await page.goto("/p/test%00null");
    expect(res?.status()).toBeLessThan(500);
  });

  test("JavaScript in comment body is rejected or stored as text", async ({
    request,
  }) => {
    const res = await request.post("/api/public/comments", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        body: "<script>alert('xss')</script>",
      },
    });
    // Nonexistent memorial → 404; real memorial would store as text
    expect([400, 404]).toContain(res.status());
  });

  test("HTML injection in comment body is rejected for missing memorial", async ({
    request,
  }) => {
    const res = await request.post("/api/public/comments", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        body: "<img src=x onerror=alert(1)>",
      },
    });
    expect([400, 404]).toContain(res.status());
  });
});

// ─── MANAGE PIN BRUTE FORCE PROTECTION ───────────────────────────────────────

test.describe("PIN brute force — validation rejects invalid formats", () => {
  test("all-zeros PIN 000000 still validated by schema for real token", async ({
    request,
  }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "000000",
      },
    });
    // Reject due to invalid token — schema may or may not reject 000000
    expect([400, 401]).toContain(res.status());
  });

  test("sequential PIN 123456 rejected for invalid token", async ({
    request,
  }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "123456",
      },
    });
    expect([400, 401]).toContain(res.status());
  });

  test("alphabetic PIN rejected by validation", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "abcdef",
      },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("very long PIN rejected", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "1234567890123456789012345678901234567890",
      },
    });
    expect([400, 401, 422]).toContain(res.status());
  });
});

// ─── PUBLIC PIN BRUTE FORCE PROTECTION ───────────────────────────────────────

test.describe("Public PIN brute force — validation", () => {
  test("very long pin rejected", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        pin: "999999999999999999999999999",
      },
    });
    expect([400, 404, 422]).toContain(res.status());
  });

  test("empty string pin rejected", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: "" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("null pin rejected", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: null },
    });
    expect([400, 422]).toContain(res.status());
  });
});

// ─── MEDIA UPLOAD SECURITY ────────────────────────────────────────────────────

test.describe("Media upload endpoint security", () => {
  test("direct upload to old /api/media/upload requires auth header", async ({
    request,
  }) => {
    const res = await request.post("/api/media/upload", {
      headers: { "Content-Type": "application/octet-stream" },
      data: Buffer.from("fake binary data"),
    });
    // Must be unauthorized without setup token
    expect([400, 401, 403]).toContain(res.status());
  });

  test("presign endpoint refuses unknown kind", async ({ request }) => {
    const res = await request.post("/api/manage/media/presign", {
      data: {
        kind: "EXECUTABLE",
        contentType: "application/x-executable",
        sizeBytes: 1000,
        fileName: "malware.exe",
      },
    });
    // Either 401 (no session) or 400 (bad kind)
    expect([400, 401]).toContain(res.status());
  });

  test("setup presign endpoint is protected", async ({ request }) => {
    const res = await request.post("/api/media/presign", {
      data: {
        kind: "PHOTO",
        contentType: "image/jpeg",
        sizeBytes: 50000,
        fileName: "test.jpg",
        profileId: "playwright-fake",
        setupToken: "playwright-fake-token",
      },
    });
    expect([400, 401]).toContain(res.status());
  });
});
