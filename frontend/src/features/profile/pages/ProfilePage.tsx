import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Grid,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/page-header/PageHeader";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";
import { UserStatusBadge } from "@/components/common/UserStatusBadge";
import { formatDate, getInitials } from "@/lib/utils";
import LogoutIcon from "@mui/icons-material/Logout";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <PageHeader
        title="My Profile"
        subtitle="View your account information and platform permissions"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Profile" },
        ]}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "primary.main",
                fontSize: "1.75rem",
                fontWeight: 700,
              }}
            >
              {getInitials(user.username)}
            </Avatar>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                USER ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: "monospace", mt: 0.5 }}>
                {user._id}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                ACCOUNT STATUS
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "capitalize", mt: 0.5 }}>
                {user.status}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                ROLE LEVEL
              </Typography>
              <Typography variant="body1" sx={{ textTransform: "capitalize", mt: 0.5 }}>
                {user.role}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                MEMBER SINCE
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {formatDate(user.createdAt, "MMMM dd, yyyy")}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Sign Out of Session
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

