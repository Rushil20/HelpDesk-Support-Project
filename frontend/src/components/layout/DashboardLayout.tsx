import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { useUIStore } from "@/stores/ui.store";

const DRAWER_WIDTH = 260;

export const DashboardLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { sidebarOpen } = useUIStore();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <AppSidebar
          mobileOpen={mobileDrawerOpen}
          onMobileClose={() => setMobileDrawerOpen(false)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: {
              xs: "100%",
              md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
            },
            transition: (theme) =>
              theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            backgroundColor: "background.default",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

