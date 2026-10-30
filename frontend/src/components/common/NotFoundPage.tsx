import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export const NotFoundPage: React.FC = () => {
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
        <SentimentDissatisfiedIcon color="action" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The page you requested does not exist or has been moved.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/dashboard")}>
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

