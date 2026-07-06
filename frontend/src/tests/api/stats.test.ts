import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/stats/route";
import { db } from "@/lib/db";
import { captureException } from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    getSubscribers: vi.fn(),
  },
}));

describe("Stats API Endpoint (GET /api/stats)", () => {
  const mockGetSubscribers = db.getSubscribers as unknown as ReturnType<typeof vi.fn>;
  const mockCaptureException = captureException as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and the total users count on successful database reads", async () => {
    mockGetSubscribers.mockReturnValue(["u1@domain.com", "u2@domain.com"]);

    const response = await GET();
    const data = (await response.json()) as { totalUsers: number };

    expect(response.status).toBe(200);
    expect(data.totalUsers).toBe(2);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("returns 500 and captures the exception in Sentry when database read fails", async () => {
    mockGetSubscribers.mockImplementation(() => {
      throw new Error("Filesystem read permission error.");
    });

    const response = await GET();
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error occurred while retrieving platform telemetry.");

    expect(mockCaptureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
