import React from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { UserRole } from "@/types/auth.types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { TicketListPage } from "@/features/tickets/pages/TicketListPage";
import { CreateTicketPage } from "@/features/tickets/pages/CreateTicketPage";
import { TicketDetailPage } from "@/features/tickets/pages/TicketDetailPage";
import { UserListPage } from "@/features/users/pages/UserListPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { UnauthorizedPage } from "@/components/common/UnauthorizedPage";
import { NotFoundPage } from "@/components/common/NotFoundPage";
import { LoadingState } from "@/components/loading-state/LoadingState";

// Route Guard for authenticated-only pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Authenticating session..." minHeight="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route Guard for public-only pages (login, register)
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingState message="Checking session..." minHeight="100vh" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Role-based Access Guard
const RoleGuard: React.FC<{ allowedRoles: UserRole[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  // Public Authentication Routes
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },

  // Authenticated App Routes with Dashboard Layout
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "tickets",
        element: <TicketListPage />,
      },
      {
        path: "tickets/new",
        element: <CreateTicketPage />,
      },
      {
        path: "tickets/:id",
        element: <TicketDetailPage />,
      },
      {
        path: "users",
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <UserListPage />
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

