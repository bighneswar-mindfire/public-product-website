import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RenderingIndicator } from "@/components/RenderingIndicator";

describe("RenderingIndicator Component", () => {
  it("renders with static positioning by default", () => {
    const { container } = render(<RenderingIndicator type="SSG" source="CMS" />);

    // Assert on the content strings
    expect(screen.getByText(/Rendering type:/i)).toHaveTextContent("SSG");
    expect(screen.getByText(/Source:/i)).toHaveTextContent("CMS");

    // Default position is "static", so it should not have absolute or fixed classes
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass("absolute");
    expect(wrapper).not.toHaveClass("fixed");
  });

  it("renders with absolute positioning when position='absolute' is passed", () => {
    const { container } = render(
      <RenderingIndicator type="CSR" source="API" position="absolute" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("absolute", "bottom-3", "right-4", "z-10");
    expect(wrapper).not.toHaveClass("fixed");
  });

  it("renders with fixed positioning when position='fixed' is passed", () => {
    const { container } = render(<RenderingIndicator type="ISR" source="CMS" position="fixed" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("fixed", "bottom-3", "right-4", "z-50");
    expect(wrapper).not.toHaveClass("absolute");
  });
});
