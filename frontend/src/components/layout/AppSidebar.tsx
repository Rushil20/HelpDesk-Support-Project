import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { getNavigationItems } from "@/config/navigation";
import { UserRoleBadge } from "@/components/common/UserRoleBadge";

const DRAWER_WIDTH = 260;

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  const navItems = getNavigationItems(user?.role);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 1,
            display: "block",
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Menu
        </Typography>

        <List sx={{ p: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check active: exact match or subroute (excluding dashboard root)
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : item.path === "/tickets?assigned=me"
                ? location.pathname === "/tickets" && location.search.includes("assigned=me")
                : item.path === "/tickets"
                ? location.pathname === "/tickets" && !location.search.includes("assigned=me")
                : location.pathname.startsWith(item.path);

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    onMobileClose();
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? "inherit" : "text.secondary",
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info footer */}
      {user && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ minWidth: 0, mr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user.email}
              </Typography>
            </Box>
            <UserRoleBadge role={user.role} size="small" />
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={sidebarOpen}
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            top: 64,
            height: "calc(100% - 64px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

