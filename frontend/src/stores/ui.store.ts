import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  themeMode: "light" | "dark";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleThemeMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  themeMode: (localStorage.getItem("theme_mode") as "light" | "dark") || "light",

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  toggleThemeMode: () =>
    set((state) => {
      const nextMode = state.themeMode === "light" ? "dark" : "light";
      localStorage.setItem("theme_mode", nextMode);
      return { themeMode: nextMode };
    }),
}));

