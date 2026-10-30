import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { UserStatus } from "@/types/auth.types";
import { USER_STATUS_CONFIG } from "@/lib/constants";

interface UserStatusBadgeProps {
  status: UserStatus;
  size?: ChipProps["size"];
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status, size = "small" }) => {
  const config = USER_STATUS_CONFIG[status] || { label: status, color: "default" };

  return (
    <Chip
      size={size}
      label={config.label}
      color={config.color}
      variant="outlined"
      sx={{
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    />
  );
};

