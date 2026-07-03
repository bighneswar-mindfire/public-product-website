import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

vi.mock("@/components/LiveStats", () => ({
  LiveStats: () => <div data-testid="mock-live-stats">Live Stats</div>,
}));

vi.mock("@/components/NewsletterForm", () => ({
  NewsletterForm: () => <div data-testid="mock-newsletter-form">Newsletter Form</div>,
}));

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the static CMS content", async () => {
    const PageJSX = await LandingPage();
    render(PageJSX);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Public Product Website");
    expect(
      screen.getByText(/Build a public product website with authentication/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Title 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1.")).toBeInTheDocument();

    expect(screen.getByTestId("mock-live-stats")).toBeInTheDocument();
    expect(screen.getByTestId("mock-newsletter-form")).toBeInTheDocument();
  });
});
