import { createAccessControl } from "better-auth/plugins/access";
import type { UserRole } from "./schema";

// Define all permissions available in the system
const statement = {
  user: ["read", "update"], // User profile operations
  post: ["create", "read", "update", "delete"], // Blog post operations
  admin: ["read", "update", "ban", "impersonate", "manageRoles"], // Admin operations
} as const;

// Create access control instance
export const ac = createAccessControl(statement);

// Define role permissions
export const adminRole = ac.newRole({
  user: ["read", "update"],
  post: ["create", "read", "update", "delete"],
  admin: ["read", "update", "ban", "impersonate", "manageRoles"],
});

export const editorRole = ac.newRole({
  user: ["read", "update"],
  post: ["create", "read", "update", "delete"],
  admin: [],
});

export const userRole = ac.newRole({
  user: ["read", "update"],
  post: ["read"],
  admin: [],
});

// Role configuration for Better Auth
export const roles = {
  admin: adminRole,
  editor: editorRole,
  user: userRole,
};

// Helper to check if a role has admin privileges
export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

// Helper to check if a role can manage content
export function canManageContent(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

// Helper to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: "Administrator",
    editor: "Editor",
    user: "User",
  };
  return names[role] || "User";
}

// Available roles for assignment
export const availableRoles: UserRole[] = ["user", "editor", "admin"];
