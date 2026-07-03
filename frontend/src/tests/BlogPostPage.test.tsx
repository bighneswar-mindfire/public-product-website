import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogPostPage from "@/app/blog/[slug]/page";

describe("Individual Blog Article Page (RSC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the async slug parameter and renders the specific blog content", async () => {
    const mockParams = Promise.resolve({
      slug: "understanding-serverless-latency",
    });

    const PageJSX = await BlogPostPage({ params: mockParams });
    render(PageJSX);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Understanding Serverless Latency in Modern Edge Computing"
    );
    expect(
      screen.getByText(/How cold starts manifest in modern serverless ecosystems/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Modern serverless architectures require zero cold starts/i)
    ).toBeInTheDocument();
  });
});
