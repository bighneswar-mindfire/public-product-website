import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogIndexPage from "@/app/blog/page";

describe("Blog Index Page (RSC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves and renders the list of blog posts from the CMS", async () => {
    const PageJSX = await BlogIndexPage();
    render(PageJSX);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Insights, Tips & Delivery Stories"
    );

    expect(
      screen.getByText("Understanding Serverless Latency in Modern Edge Computing")
    ).toBeInTheDocument();
    expect(
      screen.getByText("How We Scaled Our Log Analytics Engine to 1B Requests")
    ).toBeInTheDocument();

    expect(screen.getByText("June 15, 2026")).toBeInTheDocument();
  });
});
