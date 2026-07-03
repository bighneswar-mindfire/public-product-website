import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NewsletterForm } from "@/components/NewsletterForm";

describe("NewsletterForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows inputs, submits to API, and displays success count", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, count: 5 }),
      } as Response)
    );
    global.fetch = mockFetch;

    render(<NewsletterForm />);

    const emailInput = screen.getByPlaceholderText("enter-your-work-email@domain.com");
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    fireEvent.change(emailInput, { target: { value: "testuser@domain.com" } });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    const successMsg = await screen.findByText(/Success! Total Waitlist count is now 5/i);
    expect(successMsg).toBeInTheDocument();
  });

  it("displays custom errors returned from the backend subscription API", async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Already subscribed" }),
      } as Response)
    );
    global.fetch = mockFetch;

    render(<NewsletterForm />);

    const emailInput = screen.getByPlaceholderText("enter-your-work-email@domain.com");
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    // Simulate input typing and click submit
    fireEvent.change(emailInput, { target: { value: "duplicate@domain.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Already subscribed")).toBeInTheDocument();
    });
  });
});
