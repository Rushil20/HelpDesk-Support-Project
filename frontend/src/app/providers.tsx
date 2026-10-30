import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { createAppTheme } from "@/theme";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/features/auth/api/auth.api";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { themeMode } = useUIStore();
  const { token, setUser, setLoading } = useAuthStore();
  const theme = createAppTheme(themeMode);

  // Restore authenticated session on initial application load
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        // Token expired or invalid
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [token, setUser, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors theme={themeMode} />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

