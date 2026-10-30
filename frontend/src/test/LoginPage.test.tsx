import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { authApi } from "@/features/auth/api/auth.api";
import { UserRole, UserStatus } from "@/types/auth.types";

vi.mock("@/features/auth/api/auth.api", () => ({
  authApi: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe("LoginPage", () => {
  it("renders login form correctly with all fields and buttons", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/need an account\?/i)).toBeInTheDocument();
  });

  it("validates empty email and password submission", async () => {
    renderWithProviders(<LoginPage />);

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("submits the form successfully with valid credentials", async () => {
    vi.mocked(authApi.login).mockResolvedValueOnce({
      accessToken: "jwt-token-123",
      user: {
        _id: "user-1",
        username: "testuser",
        email: "test@example.com",
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "Password@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password@123",
      });
    });
  });
});
