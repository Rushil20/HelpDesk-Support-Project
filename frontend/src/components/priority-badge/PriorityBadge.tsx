import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { TicketPriority } from "@/types/ticket.types";
import { PRIORITY_CONFIG } from "@/lib/constants";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface PriorityBadgeProps {
  priority: TicketPriority;
  size?: ChipProps["size"];
}

const priorityIcons: Record<TicketPriority, React.ReactElement> = {
  [TicketPriority.HIGH]: <ArrowUpwardIcon fontSize="small" />,
  [TicketPriority.MEDIUM]: <RemoveIcon fontSize="small" />,
  [TicketPriority.LOW]: <ArrowDownwardIcon fontSize="small" />,
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "small" }) => {
  const config = PRIORITY_CONFIG[priority] || { label: priority, color: "default" };

  return (
    <Chip
      size={size}
      icon={priorityIcons[priority]}
      label={config.label}
      color={config.color}
      sx={{
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    />
  );
};

