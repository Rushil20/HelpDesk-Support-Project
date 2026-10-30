import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { authApi } from "@/features/auth/api/auth.api";
import { UserRole, UserStatus } from "@/types/auth.types";

vi.mock("@/features/auth/api/auth.api", () => ({
  authApi: {
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe("RegisterPage", () => {
  it("renders register form fields and notice", () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByText(/register as an employee to create and track tickets/i)).toBeInTheDocument();
  });

  it("shows validation error if password is too short", async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "alicesmith" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("submits register form successfully with valid inputs", async () => {
    vi.mocked(authApi.register).mockResolvedValueOnce({
      _id: "user-2",
      username: "alicesmith",
      email: "alice@example.com",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "alicesmith" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "Password@123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password@123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        username: "alicesmith",
        email: "alice@example.com",
        password: "Password@123",
        confirmPassword: "Password@123",
      });
    });
  });
});
