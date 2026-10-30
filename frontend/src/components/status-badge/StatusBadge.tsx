import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { TicketStatus } from "@/types/ticket.types";
import { STATUS_CONFIG } from "@/lib/constants";
import AdjustIcon from "@mui/icons-material/Adjust";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";

interface StatusBadgeProps {
  status: TicketStatus;
  size?: ChipProps["size"];
}

const statusIcons: Record<TicketStatus, React.ReactElement> = {
  [TicketStatus.OPEN]: <AdjustIcon fontSize="small" />,
  [TicketStatus.IN_PROGRESS]: <AutorenewIcon fontSize="small" />,
  [TicketStatus.RESOLVED]: <CheckCircleOutlineIcon fontSize="small" />,
  [TicketStatus.CLOSED]: <BlockIcon fontSize="small" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "small" }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: "default" };

  return (
    <Chip
      size={size}
      icon={statusIcons[status]}
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

