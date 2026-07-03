import { describe, it, expect, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/Header";
import { useAuth } from "@/auth/Providers";
import { signOut } from "firebase/auth";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/auth/Providers", () => ({
  useAuth: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock("@/auth/firebase", () => ({
  auth: {},
}));

describe("Header Component", () => {
  const mockUseAuth = useAuth as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders log in, get started when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<Header />);

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
  });

  it("renders dashboard and log out when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@domain.com", uid: "abc1234" },
      loading: false,
    });
    render(<Header />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
  });

  it("triggers log out whenlog out button is clicked", async () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@domain.com", uid: "abc1234" },
      loading: false,
    });
    render(<Header />);

    const logoutButton = screen.getByText("Log Out");
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalled();
  });
});
