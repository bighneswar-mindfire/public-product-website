// frontend/src/__tests__/api/subscribe.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/subscribe/route";
import { db } from "@/lib/db";

// Mock the local database module to isolate the API handler logic
vi.mock("@/lib/db", () => ({
  db: {
    addSubscriber: vi.fn(),
  },
}));

describe("Subscribe API Endpoint (POST /api/subscribe)", () => {
  const mockAddSubscriber = db.addSubscriber as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and waitlist count on successful unique email registration", async () => {
    mockAddSubscriber.mockReturnValue({ success: true, count: 3 });

    // 1. Create a native Web API Request object
    const req = new Request("http://localhost:3000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "newuser@domain.com" }),
    });

    // 2. Call the POST handler directly
    const response = await POST(req);
    const data = (await response.json()) as { success: boolean; count: number };

    // 3. Assert on the response structure
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.count).toBe(3);
    expect(db.addSubscriber).toHaveBeenCalledWith("newuser@domain.com");
  });

  it("returns 400 when the email parameter is malformed or missing", async () => {
    const req = new Request("http://localhost:3000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-format" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid email format. Please enter a valid email.");
    expect(db.addSubscriber).not.toHaveBeenCalled();
  });

  it("returns 409 when the email address has already subscribed", async () => {
    mockAddSubscriber.mockReturnValue({ success: false, error: "Already subscribed" });

    const req = new Request("http://localhost:3000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "duplicate@domain.com" }),
    });

    const response = await POST(req);
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(409);
    expect(data.error).toBe("Already subscribed");
  });
});
