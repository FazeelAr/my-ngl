import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabase = vi.fn();
const createToken = vi.fn();
const hashPassword = vi.fn();
const verifyPassword = vi.fn();
const verifyToken = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase,
}));

vi.mock("@/lib/auth", () => ({
  createToken,
  hashPassword,
  verifyPassword,
  verifyToken,
  getBearerToken: vi.fn(),
}));

function makeUsersQueryResult(result) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue(result),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  };
}

describe("Auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid signup payload", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "bad-email", password: "12345678", username: "u" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.detail).toContain("Invalid email");
  });

  it("creates user on signup and returns token", async () => {
    getSupabase.mockReturnValue(makeUsersQueryResult({ data: null, error: null }));
    hashPassword.mockResolvedValue("hashed-password");
    createToken.mockReturnValue("token-1");

    const { POST } = await import("@/app/api/auth/signup/route");
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "password123",
        username: "testuser",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe("token-1");
    expect(json.email).toBe("user@example.com");
    expect(hashPassword).toHaveBeenCalledTimes(1);
  });

  it("logs user in with valid credentials", async () => {
    getSupabase.mockReturnValue(
      makeUsersQueryResult({
        data: { id: "u1", email: "user@example.com", username: "u", password: "hash" },
        error: null,
      }),
    );
    verifyPassword.mockResolvedValue(true);
    createToken.mockReturnValue("token-2");

    const { POST } = await import("@/app/api/auth/login/route");
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.token).toBe("token-2");
    expect(verifyPassword).toHaveBeenCalledTimes(1);
  });

  it("verifies token payload", async () => {
    verifyToken.mockReturnValue({ user_id: "u1", email: "user@example.com" });

    const { POST } = await import("@/app/api/auth/verify/route");
    const req = new Request("http://localhost/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token: "abc" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user_id).toBe("u1");
  });
});
