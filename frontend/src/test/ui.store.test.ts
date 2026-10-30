import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/stores/ui.store";

describe("useUIStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useUIStore.setState({ sidebarOpen: true, themeMode: "light" });
  });

  it("should toggle sidebar state", () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("should set sidebar open explicitly", () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("should toggle theme mode between light and dark and persist to localStorage", () => {
    expect(useUIStore.getState().themeMode).toBe("light");

    useUIStore.getState().toggleThemeMode();
    expect(useUIStore.getState().themeMode).toBe("dark");
    expect(localStorage.getItem("theme_mode")).toBe("dark");

    useUIStore.getState().toggleThemeMode();
    expect(useUIStore.getState().themeMode).toBe("light");
    expect(localStorage.getItem("theme_mode")).toBe("light");
  });
});

