import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabase = vi.fn();
const getBearerToken = vi.fn();
const verifyToken = vi.fn();
const invalidateCacheByPrefix = vi.fn();
const getOrSetCache = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase,
}));

vi.mock("@/lib/auth", () => ({
  getBearerToken,
  verifyToken,
}));

vi.mock("@/lib/cache", () => ({
  invalidateCacheByPrefix,
  getOrSetCache,
}));

describe("NGL API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOrSetCache.mockImplementation(async (_key, _ttl, loader) => loader());
  });

  it("creates NGL for authenticated user", async () => {
    getBearerToken.mockReturnValue("token");
    verifyToken.mockReturnValue({ user_id: "u1" });
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    });

    const { POST } = await import("@/app/api/ngl/create/route");
    const req = new Request("http://localhost/api/ngl/create", {
      method: "POST",
      body: JSON.stringify({ question: "What do you think?", is_anonymous: true }),
      headers: { "Content-Type": "application/json", Authorization: "Bearer token" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ngl_id).toHaveLength(8);
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("user-ngls:u1");
  });

  it("returns NGL by id", async () => {
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "abc12345", question: "Q", is_anonymous: true },
              error: null,
            }),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/ngl/[nglId]/route");
    const res = await GET(new Request("http://localhost/api/ngl/abc12345"), {
      params: { nglId: "abc12345" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("abc12345");
  });

  it("submits response and invalidates response cache", async () => {
    const fromMock = vi.fn((table) => {
      if (table === "ngls") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "abc12345", is_anonymous: false },
                error: null,
              }),
            })),
          })),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    getSupabase.mockReturnValue({ from: fromMock });

    const { POST } = await import("@/app/api/ngl/[nglId]/respond/route");
    const res = await POST(
      new Request("http://localhost/api/ngl/abc12345/respond", {
        method: "POST",
        body: JSON.stringify({ message: "Great app", responder_name: "Rahul" }),
        headers: { "Content-Type": "application/json" },
      }),
      { params: { nglId: "abc12345" } },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Great app");
    expect(invalidateCacheByPrefix).toHaveBeenCalledWith("responses:abc12345");
  });

  it("fetches responses list", async () => {
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [{ id: "r1", message: "hello" }],
              error: null,
            }),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/ngl/[nglId]/responses/route");
    const res = await GET(new Request("http://localhost/api/ngl/abc12345/responses"), {
      params: { nglId: "abc12345" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
  });

  it("fetches user-owned NGL list", async () => {
    getBearerToken.mockReturnValue("token");
    verifyToken.mockReturnValue({ user_id: "u1" });
    getSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [{ id: "n1" }, { id: "n2" }],
              error: null,
            }),
          })),
        })),
      })),
    });

    const { GET } = await import("@/app/api/user/[userId]/ngls/route");
    const res = await GET(new Request("http://localhost/api/user/u1/ngls"), {
      params: { userId: "u1" },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
  });
});
