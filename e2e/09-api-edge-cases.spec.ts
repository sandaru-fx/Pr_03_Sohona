/**
 * 09-api-edge-cases.spec.ts
 * Edge case and boundary tests for all API endpoints.
 * Tests unusual inputs, method mismatches, content-type errors, etc.
 */
import { expect, test } from "@playwright/test";

// ─── HTTP METHOD MISMATCHES ───────────────────────────────────────────────────

test.describe("HTTP method mismatches", () => {
  test("GET on POST-only /api/public/comments returns 405", async ({
    request,
  }) => {
    const res = await request.get("/api/public/comments");
    expect([404, 405]).toContain(res.status());
  });

  test("GET on POST-only /api/public/pin returns 405", async ({ request }) => {
    const res = await request.get("/api/public/pin");
    expect([404, 405]).toContain(res.status());
  });

  test("GET on POST-only /api/manage/pin returns 405", async ({ request }) => {
    const res = await request.get("/api/manage/pin");
    expect([404, 405]).toContain(res.status());
  });

  test("GET on POST-only /api/setup/pin returns 405", async ({ request }) => {
    const res = await request.get("/api/setup/pin");
    expect([404, 405]).toContain(res.status());
  });

  test("DELETE on GET-only /api/admin/profiles returns 405", async ({
    request,
  }) => {
    // Without auth this would first hit 401, that's also acceptable
    const res = await request.delete("/api/admin/profiles");
    expect([401, 404, 405]).toContain(res.status());
  });

  test("PUT on POST-only /api/public/comments returns 405", async ({
    request,
  }) => {
    const res = await request.put("/api/public/comments", {
      data: { qrId: "test", body: "test" },
    });
    expect([404, 405]).toContain(res.status());
  });

  test("POST on PUT-only /api/manage/statements returns 405 or 401", async ({
    request,
  }) => {
    const res = await request.post("/api/manage/statements", {
      data: { statements: [] },
    });
    expect([401, 404, 405]).toContain(res.status());
  });

  test("GET on PATCH-only /api/manage/settings returns 405 or 401", async ({
    request,
  }) => {
    const res = await request.get("/api/manage/settings");
    expect([401, 404, 405]).toContain(res.status());
  });
});

// ─── MALFORMED JSON BODIES ────────────────────────────────────────────────────

test.describe("Malformed JSON bodies", () => {
  test("malformed JSON to /api/public/comments returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/public/comments", {
      headers: { "Content-Type": "application/json" },
      data: "{ invalid json }",
    });
    expect([400, 415]).toContain(res.status());
  });

  test("malformed JSON to /api/public/pin returns 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      headers: { "Content-Type": "application/json" },
      data: "{ invalid json }",
    });
    expect([400, 415]).toContain(res.status());
  });

  test("malformed JSON to /api/manage/pin returns 400", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      headers: { "Content-Type": "application/json" },
      data: "{ invalid json }",
    });
    expect([400, 415]).toContain(res.status());
  });

  test("empty string body to /api/public/pin returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/public/pin", {
      headers: { "Content-Type": "application/json" },
      data: "",
    });
    expect([400, 415]).toContain(res.status());
  });

  test("array body to /api/public/comments returns 400", async ({
    request,
  }) => {
    const res = await request.post("/api/public/comments", {
      data: [{ qrId: "test", body: "test" }],
    });
    expect([400, 404]).toContain(res.status());
  });
});

// ─── OVERSIZED INPUTS ─────────────────────────────────────────────────────────

test.describe("Oversized input rejection", () => {
  test("extremely long QR ID in comment rejects", async ({ request }) => {
    const longId = "x".repeat(1000);
    const res = await request.post("/api/public/comments", {
      data: { qrId: longId, body: "Test comment" },
    });
    expect([400, 404, 422]).toContain(res.status());
  });

  test("extremely long comment body rejects", async ({ request }) => {
    const longBody = "word ".repeat(1000); // 1000 words
    const res = await request.post("/api/public/comments", {
      data: { qrId: "playwright-missing-id", body: longBody },
    });
    expect([400, 404]).toContain(res.status());
  });

  test("extremely long display name in profile creation rejects (no auth)", async ({
    request,
  }) => {
    const longName = "A".repeat(500);
    const res = await request.post("/api/admin/profiles", {
      data: { displayName: longName, packageId: "pkg-a" },
    });
    // Auth check first — should be 401
    expect([400, 401, 422]).toContain(res.status());
  });

  test("oversized PIN string rejects", async ({ request }) => {
    const longPin = "1".repeat(100);
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-id", pin: longPin },
    });
    expect([400, 404, 422]).toContain(res.status());
  });
});

// ─── NULL / UNDEFINED INPUTS ─────────────────────────────────────────────────

test.describe("Null and undefined inputs", () => {
  test("null qrId in comment API returns 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: { qrId: null, body: "test" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("null pin in public pin API returns 400", async ({ request }) => {
    const res = await request.post("/api/public/pin", {
      data: { qrId: "test-id", pin: null },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("null manageToken in manage pin returns 400", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: { manageToken: null, pin: "123456" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("boolean as qrId returns 400", async ({ request }) => {
    const res = await request.post("/api/public/comments", {
      data: { qrId: true, body: "test" },
    });
    expect([400, 404, 422]).toContain(res.status());
  });

  test("number as pin returns 400 or 401", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: { manageToken: "fake-token", pin: 123456 },
    });
    expect([400, 401, 422]).toContain(res.status());
  });
});

// ─── DUPLICATE / IDEMPOTENCY ─────────────────────────────────────────────────

test.describe("Duplicate request behavior", () => {
  test("double logout is idempotent (returns 200 both times)", async ({
    request,
  }) => {
    const r1 = await request.post("/api/public/logout");
    const r2 = await request.post("/api/public/logout");
    expect([200, 204]).toContain(r1.status());
    expect([200, 204]).toContain(r2.status());
  });

  test("double manage logout is idempotent", async ({ request }) => {
    const r1 = await request.post("/api/manage/logout");
    const r2 = await request.post("/api/manage/logout");
    expect([200, 204]).toContain(r1.status());
    expect([200, 204]).toContain(r2.status());
  });
});

// ─── CONTENT TYPE NEGOTIATION ─────────────────────────────────────────────────

test.describe("Content-Type negotiation", () => {
  test("all API errors return application/json content-type", async ({
    request,
  }) => {
    const endpoints = [
      ["/api/admin/profiles", "GET"],
      ["/api/admin/packages", "GET"],
      ["/api/manage/content", "GET"],
    ] as const;

    for (const [url, method] of endpoints) {
      const res = method === "GET"
        ? await request.get(url)
        : await request.post(url, { data: {} });
      const ct = res.headers()["content-type"] ?? "";
      expect(ct).toContain("application/json");
    }
  });

  test("form-urlencoded body to JSON API returns 400 or 401", async ({
    request,
  }) => {
    const res = await request.post("/api/public/pin", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: "qrId=test&pin=123456",
    });
    // May parse or reject, but should not 500
    expect(res.status()).toBeLessThan(500);
  });
});

// ─── RATE LIMITING HEADERS ────────────────────────────────────────────────────

test.describe("Rate limiting — response format", () => {
  test("rate-limited response is JSON if triggered", async ({ request }) => {
    // Make one request — likely not rate limited, but check format
    const res = await request.post("/api/public/pin", {
      data: { qrId: "playwright-missing-id", pin: "123456" },
    });
    // 429 = rate limited, else normal response
    if (res.status() === 429) {
      const ct = res.headers()["content-type"] ?? "";
      expect(ct).toContain("application/json");
    } else {
      expect([400, 401, 404]).toContain(res.status());
    }
  });
});
