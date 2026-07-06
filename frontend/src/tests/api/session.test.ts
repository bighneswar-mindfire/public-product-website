import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "@/app/api/auth/session/route";
import { signSessionToken } from "@/auth/jwt";

const mockSetCookie = vi.fn();
const mockDeleteCookie = vi.fn();

// Mock Next.js cookies utility
vi.mock("next/headers", () => ({
  cookies: () => ({
    set: mockSetCookie,
    delete: mockDeleteCookie,
  }),
}));

vi.mock("@/auth/jwt", () => ({
  signSessionToken: vi.fn(),
}));

describe("Session Auth API Endpoint (/api/auth/session)", () => {
  const mockSignSessionToken = signSessionToken as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a signed JWT and sets a secure httpOnly cookie on POST", async () => {
    mockSignSessionToken.mockResolvedValue("mocked-signed-jwt-token-hash");

    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@domain.com", uid: "uid123" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(signSessionToken).toHaveBeenCalledWith({ email: "admin@domain.com", uid: "uid123" });

    expect(mockSetCookie).toHaveBeenCalledWith(
      "firebase-session",
      "mocked-signed-jwt-token-hash",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );
  });

  it("returns 400 when session parameter schemas are incorrect or missing", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "uid123" }), // Missing email
    });

    const response = await POST(req);
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing session parameters.");
    expect(mockSetCookie).not.toHaveBeenCalled();
  });

  it("removes the session cookie on DELETE", async () => {
    const response = await DELETE();
    const data = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(mockDeleteCookie).toHaveBeenCalledWith("firebase-session");
  });
});
