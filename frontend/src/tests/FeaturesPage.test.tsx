import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import FeaturesPage from "@/app/features/page";

describe("Features Page (RSC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders features from the CMS", async () => {
    const PageJSX = await FeaturesPage();
    render(PageJSX);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Facilities we provide");

    expect(screen.getByText("Feature 1")).toBeInTheDocument();
    expect(screen.getByText("Feature description 1.")).toBeInTheDocument();

    expect(screen.getByText("Feature 2")).toBeInTheDocument();
    expect(screen.getByText("Feature 3")).toBeInTheDocument();
  });
});
