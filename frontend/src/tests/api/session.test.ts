import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "@/app/api/auth/session/route";
import { signSessionToken } from "@/auth/jwt";
import { getAdminAuth } from "@/auth/firebaseAdmin";

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

const mockVerifyIdToken = vi.fn();
vi.mock("@/auth/firebaseAdmin", () => ({
  getAdminAuth: vi.fn(() => ({ verifyIdToken: mockVerifyIdToken })),
}));

describe("Session Auth API Endpoint (/api/auth/session)", () => {
  const mockSignSessionToken = signSessionToken as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies the Firebase ID token, then signs a JWT and sets a secure httpOnly cookie on POST", async () => {
    mockVerifyIdToken.mockResolvedValue({ email: "admin@domain.com", uid: "uid123" });
    mockSignSessionToken.mockResolvedValue("mocked-signed-jwt-token-hash");

    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "valid-firebase-id-token" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockVerifyIdToken).toHaveBeenCalledWith("valid-firebase-id-token");
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

  it("returns 400 when the ID token is missing", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@domain.com", uid: "uid123" }), // no idToken
    });

    const response = await POST(req);
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing ID token.");
    expect(mockVerifyIdToken).not.toHaveBeenCalled();
    expect(mockSetCookie).not.toHaveBeenCalled();
  });

  it("returns 401 and sets no cookie when the ID token fails verification", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Firebase ID token has expired"));

    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "forged-or-expired-token" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid authentication token.");
    expect(signSessionToken).not.toHaveBeenCalled();
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
