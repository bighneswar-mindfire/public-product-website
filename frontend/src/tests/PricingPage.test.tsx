import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingPage from "@/app/pricing/page";

describe("Pricing Page (RSC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pricings from the CMS", async () => {
    const PageJSX = await PricingPage();
    render(PageJSX);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Simple, Predictable Tier Pricing"
    );

    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();

    expect(screen.getByText("1 Team Member")).toBeInTheDocument();
    expect(screen.getByText("Advanced Analytics Dashboard")).toBeInTheDocument();
  });
});
