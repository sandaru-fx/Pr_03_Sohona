/**
 * 04-manage-api.spec.ts
 * Manage API — unauthenticated / bad-input tests that don't need a live session.
 * We also test manage-pin validation thoroughly.
 */
import { expect, test } from "@playwright/test";

// ─── MANAGE PIN API ───────────────────────────────────────────────────────────

test.describe("POST /api/manage/pin — validation", () => {
  test("rejects missing manageToken", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: { pin: "123456" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects missing pin", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: { manageToken: "playwright-fake-manage-token" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects short pin", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: { manageToken: "playwright-fake-manage-token", pin: "12" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("rejects invalid manage token with 401", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "123456",
      },
    });
    expect([400, 401, 404]).toContain(res.status());
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBeTruthy();
  });

  test("rejects empty body", async ({ request }) => {
    const res = await request.post("/api/manage/pin", { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test("response has no-store cache control", async ({ request }) => {
    const res = await request.post("/api/manage/pin", {
      data: {
        manageToken: "playwright-invalid-manage-token-zzzz",
        pin: "123456",
      },
    });
    const cc = res.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-store");
  });

  test("returns JSON on validation error", async ({ request }) => {
    const res = await request.post("/api/manage/pin", { data: {} });
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });
});

// ─── MANAGE STATEMENTS — unauthenticated ────────────────────────────────────

test.describe("PUT /api/manage/statements — unauthenticated", () => {
  test("returns 401 without manage session", async ({ request }) => {
    const res = await request.put("/api/manage/statements", {
      data: { statements: [{ body: "Test statement." }] },
    });
    expect(res.status()).toBe(401);
  });

  test("returns JSON on 401", async ({ request }) => {
    const res = await request.put("/api/manage/statements", {
      data: { statements: [] },
    });
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("application/json");
  });

  test("returns 401 with empty body", async ({ request }) => {
    const res = await request.put("/api/manage/statements", { data: {} });
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE SETTINGS — unauthenticated ──────────────────────────────────────

test.describe("PATCH /api/manage/settings — unauthenticated", () => {
  test("returns 401 for isPublicPinRequired: true", async ({ request }) => {
    const res = await request.patch("/api/manage/settings", {
      data: { isPublicPinRequired: true },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 for isPublicPinRequired: false", async ({ request }) => {
    const res = await request.patch("/api/manage/settings", {
      data: { isPublicPinRequired: false },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 with empty body", async ({ request }) => {
    const res = await request.patch("/api/manage/settings", { data: {} });
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE COMMENTS — unauthenticated ──────────────────────────────────────

test.describe("DELETE /api/manage/comments/[id] — unauthenticated", () => {
  test("returns 401 for any comment id", async ({ request }) => {
    const res = await request.delete(
      "/api/manage/comments/507f1f77bcf86cd799439011",
    );
    expect(res.status()).toBe(401);
  });

  test("returns 401 for random string id", async ({ request }) => {
    const res = await request.delete("/api/manage/comments/playwright-fake-id");
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE MEDIA DELETE — unauthenticated ───────────────────────────────────

test.describe("DELETE /api/manage/media/[id] — unauthenticated", () => {
  test("returns 401 for any media id", async ({ request }) => {
    const res = await request.delete(
      "/api/manage/media/507f1f77bcf86cd799439011",
    );
    expect(res.status()).toBe(401);
  });

  test("returns 401 for random string id", async ({ request }) => {
    const res = await request.delete("/api/manage/media/playwright-fake-id");
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE MEDIA PATCH — unauthenticated ────────────────────────────────────

test.describe("PATCH /api/manage/media/[id] — unauthenticated", () => {
  test("returns 401 for description update", async ({ request }) => {
    const res = await request.patch(
      "/api/manage/media/507f1f77bcf86cd799439011",
      {
        data: { description: "New description" },
      },
    );
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE MEDIA PRESIGN — unauthenticated ───────────────────────────────────

test.describe("POST /api/manage/media/presign — unauthenticated", () => {
  test("returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/manage/media/presign", {
      data: {
        kind: "PHOTO",
        contentType: "image/jpeg",
        sizeBytes: 50000,
        fileName: "test.jpg",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 for VIDEO kind", async ({ request }) => {
    const res = await request.post("/api/manage/media/presign", {
      data: {
        kind: "VIDEO",
        contentType: "video/mp4",
        sizeBytes: 5000000,
        fileName: "test.mp4",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 401 for VOICE kind", async ({ request }) => {
    const res = await request.post("/api/manage/media/presign", {
      data: {
        kind: "VOICE",
        contentType: "audio/mpeg",
        sizeBytes: 100000,
        fileName: "test.mp3",
      },
    });
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE MEDIA CONFIRM — unauthenticated ──────────────────────────────────

test.describe("POST /api/manage/media/confirm — unauthenticated", () => {
  test("returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/manage/media/confirm", {
      data: {
        kind: "PHOTO",
        contentType: "image/jpeg",
        sizeBytes: 50000,
        fileName: "test.jpg",
        r2ObjectKey: "media/profile-id/test.jpg",
      },
    });
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE CONTENT — unauthenticated ────────────────────────────────────────

test.describe("GET /api/manage/content — unauthenticated", () => {
  test("returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/manage/content");
    expect(res.status()).toBe(401);
  });
});

// ─── MANAGE LOGOUT ───────────────────────────────────────────────────────────

test.describe("POST /api/manage/logout", () => {
  test("returns 200 even without a manage session", async ({ request }) => {
    const res = await request.post("/api/manage/logout");
    expect([200, 204]).toContain(res.status());
  });
});
