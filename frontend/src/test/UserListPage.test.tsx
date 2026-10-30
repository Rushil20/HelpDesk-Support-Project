import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { UserListPage } from "@/features/users/pages/UserListPage";
import { usersApi } from "@/features/users/api/users.api";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole, UserStatus } from "@/types/auth.types";

vi.mock("@/features/users/api/users.api", () => ({
  usersApi: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    changeUserRole: vi.fn(),
    deactivateUser: vi.fn(),
  },
}));

const mockUsers = [
  {
    _id: "admin-1",
    username: "superadmin",
    email: "admin@helpdesk.com",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "emp-1",
    username: "john_employee",
    email: "john@company.com",
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
  },
  {
    _id: "agent-1",
    username: "sarah_agent",
    email: "sarah@company.com",
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    createdAt: "2026-01-06T00:00:00.000Z",
    updatedAt: "2026-01-06T00:00:00.000Z",
  },
];

describe("UserListPage (Admin User Management)", () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth(mockUsers[0], "admin-token");

    vi.mocked(usersApi.listUsers).mockResolvedValue({
      items: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it("renders page header and user table with action buttons", async () => {
    renderWithProviders(<UserListPage />);

    expect(screen.getByRole("heading", { name: /user management/i })).toBeInTheDocument();
    expect(await screen.findByText("superadmin (You)")).toBeInTheDocument();
    expect(screen.getByText("john_employee")).toBeInTheDocument();
    expect(screen.getByText("sarah_agent")).toBeInTheDocument();

    // Check action buttons for employee and agent
    expect(screen.getByRole("button", { name: /make agent/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /make employee/i })).toBeInTheDocument();
  });

  it("opens change role dialog and promotes employee to agent", async () => {
    vi.mocked(usersApi.changeUserRole).mockResolvedValueOnce({
      ...mockUsers[1],
      role: UserRole.AGENT,
    });

    renderWithProviders(<UserListPage />);

    const makeAgentBtn = await screen.findByRole("button", { name: /make agent/i });
    fireEvent.click(makeAgentBtn);

    // Dialog appears with confirmation
    expect(screen.getByRole("heading", { name: /change user role/i })).toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to change 'john_employee' from employee to support agent\?/i)
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /confirm role change/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(usersApi.changeUserRole).toHaveBeenCalledWith("emp-1", UserRole.AGENT);
    });
  });

  it("provides view password toggle in Create User dialog", async () => {
    renderWithProviders(<UserListPage />);

    const createUserBtn = screen.getByRole("button", { name: /create user/i });
    fireEvent.click(createUserBtn);

    const passwordInput = screen.getByLabelText(/initial password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: /toggle password visibility/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("password");
  });

  it("provides Reset Password dialog with view password option for users", async () => {
    vi.mocked(usersApi.updateUser).mockResolvedValueOnce({
      ...mockUsers[1],
    });

    renderWithProviders(<UserListPage />);

    const resetBtns = await screen.findAllByRole("button", { name: /reset password/i });
    fireEvent.click(resetBtns[0]);

    expect(screen.getByRole("heading", { name: /reset user password/i })).toBeInTheDocument();
    const newPwdInput = screen.getByLabelText(/new password/i) as HTMLInputElement;
    expect(newPwdInput).toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: /toggle password visibility/i });
    expect(toggleBtn).toBeInTheDocument();

    const updateBtn = screen.getByRole("button", { name: /update password/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(usersApi.updateUser).toHaveBeenCalledWith(
        "emp-1",
        expect.objectContaining({ password: expect.any(String) })
      );
    });
  });
});
