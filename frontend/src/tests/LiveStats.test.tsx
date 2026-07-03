import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveStats } from "@/components/LiveStats";

describe("LiveStats Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and displays dynamic subscriber count upon mount", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalUsers: 14285 }),
      } as Response)
    );

    render(<LiveStats />);

    expect(screen.getByText("...")).toBeInTheDocument();

    const statsValue = await screen.findByText("14,285");
    expect(statsValue).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("registers an interval to poll the backend stats API", async () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval");

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ totalUsers: 10 }),
      } as Response)
    );

    render(<LiveStats />);
    await screen.findByText("10");

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

    setIntervalSpy.mockRestore();
  });
});
