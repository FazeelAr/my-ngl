import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabase = vi.fn();
const createToken = vi.fn();
const verifyPassword = vi.fn();
const getOrSetCache = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase,
}));

vi.mock("@/lib/auth", () => ({
  createToken,
  verifyPassword,
  getBearerToken: vi.fn(),
  verifyToken: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock("@/lib/cache", () => ({
  getOrSetCache,
  invalidateCacheByPrefix: vi.fn(),
}));

describe("Concurrency behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles 100 concurrent login requests without failures", async () => {
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: "u1",
                email: "user@example.com",
                username: "user",
                password: "hash",
              },
              error: null,
            }),
          })),
        })),
      })),
    });

    verifyPassword.mockImplementation(async () => true);
    createToken.mockReturnValue("token");

    const { POST } = await import("@/app/api/auth/login/route");

    const requests = Array.from({ length: 100 }, () =>
      POST(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", password: "password123" }),
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const responses = await Promise.all(requests);
    const failed = responses.filter((res) => res.status !== 200);

    expect(failed).toHaveLength(0);
  }, 20_000);

  it("handles 100 concurrent response-list reads", async () => {
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [{ id: "r1", message: "m" }],
              error: null,
            }),
          })),
        })),
      })),
    });

    getOrSetCache.mockImplementation(async (_key, _ttl, loader) => loader());

    const { GET } = await import("@/app/api/ngl/[nglId]/responses/route");

    const reads = Array.from({ length: 100 }, () =>
      GET(new Request("http://localhost/api/ngl/a1b2c3d4/responses"), {
        params: { nglId: "a1b2c3d4" },
      }),
    );

    const responses = await Promise.all(reads);
    const failed = responses.filter((res) => res.status !== 200);

    expect(failed).toHaveLength(0);
  }, 20_000);
});
