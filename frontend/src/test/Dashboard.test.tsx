import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ticketsApi } from "@/features/tickets/api/tickets.api";
import { usersApi } from "@/features/users/api/users.api";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole, UserStatus } from "@/types/auth.types";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";

vi.mock("@/features/tickets/api/tickets.api", () => ({
  ticketsApi: {
    listTickets: vi.fn(),
  },
}));

vi.mock("@/features/users/api/users.api", () => ({
  usersApi: {
    listUsers: vi.fn(),
  },
}));

const mockTickets = [
  {
    _id: "ticket-1",
    title: "Cannot access VPN network",
    description: "Cisco AnyConnect gives timeout error 404.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    createdBy: {
      _id: "u-1",
      username: "johndoe",
      email: "john@example.com",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    assignedTo: null,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
];

const mockUsers = [
  {
    _id: "u-1",
    username: "johndoe",
    email: "john@example.com",
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    _id: "a-1",
    username: "agentsmith",
    email: "smith@example.com",
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.mocked(ticketsApi.listTickets).mockResolvedValue({
      items: mockTickets,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    vi.mocked(usersApi.listUsers).mockResolvedValue({
      items: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it("renders Employee Dashboard when authenticated as an employee", async () => {
    useAuthStore.getState().setAuth(
      {
        _id: "u-1",
        username: "johndoe",
        email: "john@example.com",
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      "mock-token"
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/employee helpdesk/i)).toBeInTheDocument();
    expect(screen.getByText(/track your support requests and get help/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create ticket/i })).toBeInTheDocument();
  });

  it("renders Agent Dashboard when authenticated as an agent", async () => {
    useAuthStore.getState().setAuth(
      {
        _id: "a-1",
        username: "agentsmith",
        email: "smith@example.com",
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      "mock-token"
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/support agent queue/i)).toBeInTheDocument();
    expect(screen.getByText(/manage incoming requests, triage issues, and resolve tickets/i)).toBeInTheDocument();
  });

  it("renders Admin Dashboard when authenticated as an admin", async () => {
    useAuthStore.getState().setAuth(
      {
        _id: "adm-1",
        username: "adminuser",
        email: "admin@example.com",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      "mock-token"
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/system administration/i)).toBeInTheDocument();
    expect(screen.getByText(/overview of company users, support queues, and resolution performance/i)).toBeInTheDocument();
    expect(screen.getByText(/total users/i)).toBeInTheDocument();
  });
});
