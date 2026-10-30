import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types/auth.types";
import { EmployeeDashboard } from "../components/EmployeeDashboard";
import { AgentDashboard } from "../components/AgentDashboard";
import { AdminDashboard } from "../components/AdminDashboard";

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role === UserRole.ADMIN) {
    return <AdminDashboard />;
  }

  if (user?.role === UserRole.AGENT) {
    return <AgentDashboard />;
  }

  return <EmployeeDashboard />;
};

