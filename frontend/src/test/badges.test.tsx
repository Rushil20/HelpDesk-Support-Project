import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { StatusBadge } from "@/components/status-badge/StatusBadge";
import { PriorityBadge } from "@/components/priority-badge/PriorityBadge";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import { UserStatusBadge } from "@/components/common/UserStatusBadge";
import { TicketStatus, TicketPriority } from "@/types/ticket.types";
import { UserRole, UserStatus } from "@/types/auth.types";

describe("Badge Components", () => {
  describe("StatusBadge", () => {
    it("renders Open status correctly", () => {
      renderWithProviders(<StatusBadge status={TicketStatus.OPEN} />);
      expect(screen.getByText("Open")).toBeInTheDocument();
    });

    it("renders In Progress status correctly", () => {
      renderWithProviders(<StatusBadge status={TicketStatus.IN_PROGRESS} />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("renders Resolved status correctly", () => {
      renderWithProviders(<StatusBadge status={TicketStatus.RESOLVED} />);
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });

    it("renders Closed status correctly", () => {
      renderWithProviders(<StatusBadge status={TicketStatus.CLOSED} />);
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });
  });

  describe("PriorityBadge", () => {
    it("renders Low priority correctly", () => {
      renderWithProviders(<PriorityBadge priority={TicketPriority.LOW} />);
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("renders Medium priority correctly", () => {
      renderWithProviders(<PriorityBadge priority={TicketPriority.MEDIUM} />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("renders High priority correctly", () => {
      renderWithProviders(<PriorityBadge priority={TicketPriority.HIGH} />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });
  });

  describe("UserRoleBadge", () => {
    it("renders Employee role badge", () => {
      renderWithProviders(<UserRoleBadge role={UserRole.EMPLOYEE} />);
      expect(screen.getByText("Employee")).toBeInTheDocument();
    });

    it("renders Support Agent role badge", () => {
      renderWithProviders(<UserRoleBadge role={UserRole.AGENT} />);
      expect(screen.getByText("Support Agent")).toBeInTheDocument();
    });

    it("renders Administrator role badge", () => {
      renderWithProviders(<UserRoleBadge role={UserRole.ADMIN} />);
      expect(screen.getByText("Administrator")).toBeInTheDocument();
    });
  });

  describe("UserStatusBadge", () => {
    it("renders Active status badge", () => {
      renderWithProviders(<UserStatusBadge status={UserStatus.ACTIVE} />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders Inactive status badge", () => {
      renderWithProviders(<UserStatusBadge status={UserStatus.INACTIVE} />);
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });
  });
});
