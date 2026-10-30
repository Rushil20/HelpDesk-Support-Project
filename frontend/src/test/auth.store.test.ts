import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth.store";
import { User, UserRole, UserStatus } from "@/types/auth.types";

const mockUser: User = {
  _id: "user-123",
  username: "janedoe",
  email: "jane.doe@example.com",
  role: UserRole.EMPLOYEE,
  status: UserStatus.ACTIVE,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("should initialize with default unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should handle setAuth correctly and update localStorage", () => {
    const token = "mock-jwt-token";
    useAuthStore.getState().setAuth(mockUser, token);

    const state = useAuthStore.getState();
    expect(state.token).toBe(token);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem("auth_token")).toBe(token);
  });

  it("should handle logout correctly and clear localStorage", () => {
    useAuthStore.getState().setAuth(mockUser, "mock-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth_token")).toBeNull();
  });

  it("should update partial user fields", () => {
    useAuthStore.getState().setAuth(mockUser, "mock-token");
    useAuthStore.getState().updateUser({ username: "janetdoe" });

    const state = useAuthStore.getState();
    expect(state.user?.username).toBe("janetdoe");
    expect(state.user?.email).toBe("jane.doe@example.com");
  });

  it("should check user roles correctly", () => {
    useAuthStore.getState().setAuth(mockUser, "mock-token");

    expect(useAuthStore.getState().hasRole(UserRole.EMPLOYEE)).toBe(true);
    expect(useAuthStore.getState().hasRole(UserRole.AGENT)).toBe(false);
    expect(useAuthStore.getState().hasRole(UserRole.ADMIN)).toBe(false);

    // Promote to agent in store
    useAuthStore.getState().updateUser({ role: UserRole.AGENT });
    expect(useAuthStore.getState().hasRole(UserRole.AGENT)).toBe(true);
    expect(useAuthStore.getState().hasRole(UserRole.EMPLOYEE)).toBe(false);
  });
});
