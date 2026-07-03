import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue("/dashboard"),
  }),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("@/auth/firebase", () => ({
  auth: {},
}));

describe("Login Page (Client Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows email and password entry, and executes signInWithEmailAndPassword on submit", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );

    const mockSignIn = signInWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>;
    mockSignIn.mockResolvedValueOnce({
      user: { email: "user@domain.com", uid: "test_uid_123" },
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("e.g. user@domain.com");
    const passwordInput = screen.getByPlaceholderText("e.g. password");

    // Updated to match your button's exact label: "Log In"
    const submitButton = screen.getByRole("button", { name: /Log In/i });

    fireEvent.change(emailInput, { target: { value: "user@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "correctPassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "user@domain.com",
        "correctPassword"
      );
    });
  });

  it("toggles to sign-up layout and triggers createUserWithEmailAndPassword on submit", async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );

    const mockCreateUser = createUserWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>;
    mockCreateUser.mockResolvedValueOnce({
      user: { email: "newuser@domain.com", uid: "test_uid_456" },
    });

    render(<LoginPage />);

    const toggleButton = screen.getByRole("button", { name: /Don't have an account\? Sign Up/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Create Account");

    const emailInput = screen.getByPlaceholderText("e.g. user@domain.com");
    const passwordInput = screen.getByPlaceholderText("e.g. password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    fireEvent.change(emailInput, { target: { value: "newuser@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "securePassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "newuser@domain.com",
        "securePassword"
      );
    });
  });
});
