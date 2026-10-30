import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingStateProps {
  message?: string;
  minHeight?: number | string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  minHeight = "200px",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight,
        gap: 2,
        p: 4,
      }}
    >
      <CircularProgress size={36} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

