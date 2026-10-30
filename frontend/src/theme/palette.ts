import { PaletteOptions } from "@mui/material/styles";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#2563eb", // Royal blue
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#475569", // Slate
    light: "#94a3b8",
    dark: "#1e293b",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f8fafc", // Very soft slate gray
    paper: "#ffffff",
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
  },
  divider: "#e2e8f0",
  success: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#ffffff",
  },
  info: {
    main: "#0284c7",
    light: "#38bdf8",
    dark: "#0369a1",
    contrastText: "#ffffff",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#b91c1c",
    contrastText: "#ffffff",
  },
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#3b82f6",
    light: "#93c5fd",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#94a3b8",
    light: "#cbd5e1",
    dark: "#64748b",
    contrastText: "#0f172a",
  },
  background: {
    default: "#0f172a",
    paper: "#1e293b",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
  },
  divider: "#334155",
  success: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#ffffff",
  },
  info: {
    main: "#38bdf8",
    light: "#7dd3fc",
    dark: "#0284c7",
    contrastText: "#ffffff",
  },
  error: {
    main: "#f87171",
    light: "#fca5a5",
    dark: "#dc2626",
    contrastText: "#ffffff",
  },
};

