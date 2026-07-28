import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const { pushMock, refreshMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue("/dashboard"),
  }),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn(),
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
      user: {
        email: "user@domain.com",
        uid: "test_uid_123",
        emailVerified: true,
        getIdToken: vi.fn().mockResolvedValue("id-token"),
      },
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

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("toggles to sign-up layout, requires full name and matching passwords, and sends a verification email", async () => {
    const mockCreateUser = createUserWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>;
    mockCreateUser.mockResolvedValueOnce({
      user: {
        email: "newuser@domain.com",
        uid: "test_uid_456",
        emailVerified: false,
        reload: vi.fn(),
      },
    });

    render(<LoginPage />);

    const toggleButton = screen.getByRole("button", { name: /Don't have an account\? Sign Up/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Create Account");

    const fullNameInput = screen.getByPlaceholderText("e.g. Jane Doe");
    const emailInput = screen.getByPlaceholderText("e.g. user@domain.com");
    const passwordInput = screen.getByPlaceholderText("e.g. password");
    const confirmPasswordInput = screen.getByPlaceholderText("Re-enter your password");
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    fireEvent.change(fullNameInput, { target: { value: "New User" } });
    fireEvent.change(emailInput, { target: { value: "newuser@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "securePassword" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "securePassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        "newuser@domain.com",
        "securePassword"
      );
    });

    expect(sendEmailVerification).toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: /Verify your email/i })).toBeInTheDocument();
    expect(screen.getByText("newuser@domain.com")).toBeInTheDocument();
  });

  it("blocks submission when passwords do not match", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Don't have an account\? Sign Up/i }));

    fireEvent.change(screen.getByPlaceholderText("e.g. Jane Doe"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. user@domain.com"), {
      target: { value: "newuser@domain.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. password"), {
      target: { value: "securePassword" },
    });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
      target: { value: "differentPassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("shows the pending-verification screen with a resend option when login email is not verified", async () => {
    const mockSignIn = signInWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>;
    mockSignIn.mockResolvedValueOnce({
      user: {
        email: "unverified@domain.com",
        uid: "test_uid_789",
        emailVerified: false,
        reload: vi.fn(),
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("e.g. user@domain.com"), {
      target: { value: "unverified@domain.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. password"), {
      target: { value: "correctPassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    expect(await screen.findByRole("heading", { name: /Verify your email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resend verification email/i })).toBeInTheDocument();
  });

  describe("auto-continue polling after verification", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("automatically establishes a session once the pending user's email becomes verified", async () => {
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        } as Response)
      );

      let verified = false;
      const pendingUser = {
        email: "newuser@domain.com",
        uid: "test_uid_456",
        emailVerified: false,
        reload: vi.fn().mockImplementation(async () => {
          if (verified) {
            pendingUser.emailVerified = true;
          }
        }),
        getIdToken: vi.fn().mockResolvedValue("fresh-id-token"),
      };

      const mockCreateUser = createUserWithEmailAndPassword as unknown as ReturnType<typeof vi.fn>;
      mockCreateUser.mockResolvedValueOnce({ user: pendingUser });

      render(<LoginPage />);

      fireEvent.click(screen.getByRole("button", { name: /Don't have an account\? Sign Up/i }));
      fireEvent.change(screen.getByPlaceholderText("e.g. Jane Doe"), {
        target: { value: "New User" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g. user@domain.com"), {
        target: { value: "newuser@domain.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("e.g. password"), {
        target: { value: "securePassword" },
      });
      fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), {
        target: { value: "securePassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

      await screen.findByRole("heading", { name: /Verify your email/i });

      // Simulate the user clicking the email link elsewhere, then let the
      // component's poll interval pick up the change.
      verified = true;

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith("/dashboard");
      });
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
