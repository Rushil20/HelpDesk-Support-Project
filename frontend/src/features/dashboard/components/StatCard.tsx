import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "primary" | "info" | "warning" | "success" | "error" | "default";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "primary",
}) => {
  const colorMap = {
    primary: { bg: "primary.light", fg: "primary.dark", border: "primary.main" },
    info: { bg: "#e0f2fe", fg: "#0369a1", border: "#0284c7" },
    warning: { bg: "#fef3c7", fg: "#b45309", border: "#f59e0b" },
    success: { bg: "#dcfce7", fg: "#15803d", border: "#10b981" },
    error: { bg: "#fee2e2", fg: "#b91c1c", border: "#ef4444" },
    default: { bg: "rgba(0,0,0,0.04)", fg: "text.secondary", border: "divider" },
  };

  const selectedColor = colorMap[color];

  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: selectedColor.bg,
              color: selectedColor.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

