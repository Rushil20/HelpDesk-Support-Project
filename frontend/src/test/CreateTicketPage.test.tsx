import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { CreateTicketPage } from "@/features/tickets/pages/CreateTicketPage";
import { ticketsApi } from "@/features/tickets/api/tickets.api";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole, UserStatus } from "@/types/auth.types";
import { TicketPriority, TicketStatus } from "@/types/ticket.types";

vi.mock("@/features/tickets/api/tickets.api", () => ({
  ticketsApi: {
    createTicket: vi.fn(),
  },
}));

describe("CreateTicketPage", () => {
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
  });

  it("renders the create ticket form fields", () => {
    renderWithProviders(<CreateTicketPage />);

    expect(screen.getByRole("heading", { name: /create new ticket/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ticket title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/detailed description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit ticket/i })).toBeInTheDocument();
  });

  it("displays validation error when title is too short", async () => {
    renderWithProviders(<CreateTicketPage />);

    fireEvent.change(screen.getByLabelText(/ticket title/i), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText(/detailed description/i), {
      target: { value: "Valid ticket description for testing." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(screen.getByText(/title must be between 5 and 120 characters/i)).toBeInTheDocument();
    });
  });

  it("submits the ticket successfully", async () => {
    vi.mocked(ticketsApi.createTicket).mockResolvedValueOnce({
      _id: "ticket-new-1",
      title: "Broken laptop charger cable",
      description: "My Macbook charger stopped charging completely.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
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
      createdAt: "2026-01-16T10:00:00.000Z",
      updatedAt: "2026-01-16T10:00:00.000Z",
    });

    renderWithProviders(<CreateTicketPage />);

    fireEvent.change(screen.getByLabelText(/ticket title/i), {
      target: { value: "Broken laptop charger cable" },
    });
    fireEvent.change(screen.getByLabelText(/detailed description/i), {
      target: { value: "My Macbook charger stopped charging completely." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(ticketsApi.createTicket).toHaveBeenCalledWith({
        title: "Broken laptop charger cable",
        description: "My Macbook charger stopped charging completely.",
        priority: TicketPriority.MEDIUM,
      });
    });
  });
});
