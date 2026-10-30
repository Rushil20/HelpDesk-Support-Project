import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SecurityIcon from "@mui/icons-material/Security";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: 480,
          p: 5,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <SecurityIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You do not have the required administrative permissions to access this page.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

