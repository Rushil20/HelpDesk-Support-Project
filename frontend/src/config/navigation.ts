import { UserRole } from "@/types/auth.types";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { SvgIconComponent } from "@mui/icons-material";

export interface NavItem {
  title: string;
  path: string;
  icon: SvgIconComponent;
  badge?: number;
}

export const getNavigationItems = (role?: UserRole): NavItem[] => {
  if (!role) return [];

  const commonProfile: NavItem = {
    title: "My Profile",
    path: "/profile",
    icon: PersonIcon,
  };

  const createTicket: NavItem = {
    title: "Create Ticket",
    path: "/tickets/new",
    icon: AddCircleOutlineIcon,
  };

  if (role === UserRole.EMPLOYEE) {
    return [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "My Tickets",
        path: "/tickets",
        icon: ConfirmationNumberIcon,
      },
      createTicket,
      commonProfile,
    ];
  }

  if (role === UserRole.AGENT) {
    return [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "All Tickets",
        path: "/tickets",
        icon: ConfirmationNumberIcon,
      },
      {
        title: "Assigned To Me",
        path: "/tickets?assigned=me",
        icon: AssignmentIndIcon,
      },
      createTicket,
      commonProfile,
    ];
  }

  if (role === UserRole.ADMIN) {
    return [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "All Tickets",
        path: "/tickets",
        icon: ConfirmationNumberIcon,
      },
      {
        title: "User Management",
        path: "/users",
        icon: PeopleIcon,
      },
      createTicket,
      commonProfile,
    ];
  }

  return [];
};

