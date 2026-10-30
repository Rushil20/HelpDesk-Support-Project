import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { UserRole } from "@/types/auth.types";
import { ROLE_LABELS } from "@/lib/constants";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

interface UserRoleBadgeProps {
  role: UserRole;
  size?: ChipProps["size"];
}

const roleIcons: Record<UserRole, React.ReactElement> = {
  [UserRole.ADMIN]: <AdminPanelSettingsIcon fontSize="small" />,
  [UserRole.AGENT]: <SupportAgentIcon fontSize="small" />,
  [UserRole.EMPLOYEE]: <PersonOutlineIcon fontSize="small" />,
};

const roleColors: Record<UserRole, "secondary" | "primary" | "default"> = {
  [UserRole.ADMIN]: "secondary",
  [UserRole.AGENT]: "primary",
  [UserRole.EMPLOYEE]: "default",
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role, size = "small" }) => {
  return (
    <Chip
      size={size}
      icon={roleIcons[role]}
      label={ROLE_LABELS[role] || role}
      color={roleColors[role]}
      variant="filled"
      sx={{
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    />
  );
};

