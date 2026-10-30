import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { TicketListPage } from "@/features/tickets/pages/TicketListPage";
import { ticketsApi } from "@/features/tickets/api/tickets.api";
import { useAuthStore } from "@/stores/auth.store";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";
import { UserRole, UserStatus } from "@/types/auth.types";

vi.mock("@/features/tickets/api/tickets.api", () => ({
  ticketsApi: {
    listTickets: vi.fn(),
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
  {
    _id: "ticket-2",
    title: "Need new monitor stand",
    description: "Ergonomic monitor stand for dual monitors.",
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.LOW,
    createdBy: {
      _id: "u-1",
      username: "johndoe",
      email: "john@example.com",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    assignedTo: {
      _id: "agent-1",
      username: "bobsupport",
      email: "bob@support.com",
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    createdAt: "2026-01-16T10:00:00.000Z",
    updatedAt: "2026-01-16T12:00:00.000Z",
  },
];

describe("TicketListPage", () => {
  beforeEach(() => {
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

    vi.mocked(ticketsApi.listTickets).mockResolvedValue({
      items: mockTickets,
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it("renders page title, action buttons, and filters", async () => {
    renderWithProviders(<TicketListPage />);

    expect(screen.getByRole("heading", { name: /my support tickets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create ticket/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by ticket title or description/i)).toBeInTheDocument();
  });

  it("renders the tickets table with retrieved tickets", async () => {
    renderWithProviders(<TicketListPage />);

    expect(await screen.findByText("Cannot access VPN network")).toBeInTheDocument();
    expect(screen.getByText("Need new monitor stand")).toBeInTheDocument();
    expect(screen.getByText("bobsupport")).toBeInTheDocument();
  });
});
