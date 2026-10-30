import React, { PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import { createAppTheme } from "@/theme";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps extends PropsWithChildren {
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    routerProps?: MemoryRouterProps;
    queryClient?: QueryClient;
  }
) {
  const testQueryClient = options?.queryClient || createTestQueryClient();
  const theme = createAppTheme("light");

  const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    return (
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MemoryRouter {...options?.routerProps}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient: testQueryClient,
  };
}

