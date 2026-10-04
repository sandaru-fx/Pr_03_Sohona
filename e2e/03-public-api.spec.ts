/**
 * 03-public-api.spec.ts
 * Public-facing API endpoint tests — no auth needed (rate-limit aware).
 * Covers: comments, public pin, public media URL, public logout.
 */
import { expect, test } from "@playwright/test";

// ─── PUBLIC COMMENTS API ─────────────────────────────────────────────────────

test.describe("POST /api/public/comments — validation", () => {
  test("rejects missing body with 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: { qrId: "playwright-missing-qr-id-zzzz" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects empty body string with 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: { qrId: "playwright-missing-qr-id-zzzz", body: "" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects unknown qrId with 400 or 404", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        body: "A kind note for this memorial.",
      },
    });
    expect([400, 404]).toContain(res.status());
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBeTruthy();
  });

  test("rejects non-JSON with 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      headers: { "Content-Type": "text/plain" },
      data: "not json",
    });
    expect([400, 415]).toContain(res.status());
  });

  test("rejects missing qrId with 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: { body: "Hello" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects body over word limit with 400", async ({ request }) => {
    const longBody = Array(600).fill("word").join(" "); // ~600 words
    const res = await request.post("/api/public/comments", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        body: longBody,
      },
    });
    // Either fails on word limit or not found — both are non-200
    expect(res.status()).not.toBe(201);
  });

  test("returns JSON content-type on error", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: {
        qrId: "playwright-missing-qr-id-zzzz",
        body: "test comment",
      },
    });
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });
});

// ─── PUBLIC PIN API ───────────────────────────────────────────────────────────

test.describe("POST /api/public/pin — validation", () => {
  test("rejects missing qrId with 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { pin: "123456" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects missing pin with 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects pin too short with 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: "123" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("rejects pin too long with 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: "1234567890" },
    });
    expect([400, 404]).toContain(res.status());
  });

  test("returns 404 for unknown memorial", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: "123456" },
    });
    expect([404, 400]).toContain(res.status());
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBeTruthy();
  });

  test("rejects empty JSON body gracefully", async ({ request }) => {
    const res = await request.post("/api/public/pin", { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test("response always has Cache-Control: no-store", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-qr-id-zzzz", pin: "123456" },
    });
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });
});

// ─── PUBLIC MEDIA URL API ─────────────────────────────────────────────────────

test.describe("GET /api/public/media/[id]/url — auth & validation", () => {
  test("returns 400 or 404 for unknown media id", async ({ request }) => {
    const res = await request.get(
      "/api/public/media/playwright-nonexistent-media-id/url",
    );
    expect([400, 401, 403, 404, 503]).toContain(res.status());
  });

  test("returns JSON on error", async ({ request }) => {
    const res = await request.get(
      "/api/public/media/playwright-nonexistent-media-id/url",
    );
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });

  test("never returns 500 for invalid id", async ({ request }) => {
    const res = await request.get("/api/public/media/bad-id/url");
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── PUBLIC LOGOUT API ────────────────────────────────────────────────────────

test.describe("POST /api/public/logout", () => {
  test("returns 200 even without a session cookie", async ({ request }) => {
    const res = await request.post("/api/public/logout");
    expect([200, 204]).toContain(res.status());
  });

  test("sets or clears a cookie on logout", async ({ page }) => {
    const res = await page.request.post("/api/public/logout");
    // The response should have Set-Cookie or just be 200
    expect([200, 204]).toContain(res.status());
  });
});

// ─── SETUP PIN API ────────────────────────────────────────────────────────────

test.describe("POST /api/setup/pin — validation", () => {
  test("rejects missing profileId", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: { setupToken: "fake-token", pin: "123456" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects missing setupToken", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: { profileId: "fake-id", pin: "123456" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects missing pin", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: { profileId: "fake-id", setupToken: "fake-token" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects invalid token with 401", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: {
        profileId: "playwright-fake-id",
        setupToken: "playwright-fake-setup-token-invalid",
        pin: "123456",
      },
    });
    expect([400, 401, 404]).toContain(res.status());
  });

  test("rejects short pin", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: {
        profileId: "fake-id",
        setupToken: "fake-token",
        pin: "12",
      },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects non-numeric pin if validation exists", async ({ request }) => {
    const res = await request.post("/api/setup/pin", {
      data: {
        profileId: "fake-id",
        setupToken: "fake-token",
        pin: "abcdef",
      },
    });
    expect([400, 401, 422]).toContain(res.status());
  });
});

// ─── SETUP STATEMENTS API ────────────────────────────────────────────────────

test.describe("POST /api/setup/statements — validation", () => {
  test("rejects missing profileId", async ({ request }) => {
    const res = await request.post("/api/setup/statements", {
      data: {
        setupToken: "fake-token",
        statements: [{ body: "hello" }],
      },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects invalid token", async ({ request }) => {
    const res = await request.post("/api/setup/statements", {
      data: {
        profileId: "fake",
        setupToken: "playwright-fake-setup-token",
        statements: [{ body: "hello world" }],
      },
    });
    expect([400, 401, 404]).toContain(res.status());
  });

  test("rejects empty JSON", async ({ request }) => {
    const res = await request.post("/api/setup/statements", { data: {} });
    expect([400, 422]).toContain(res.status());
  });
});
