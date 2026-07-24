export const USER_ROLES = [
    "User",
    "Admin",
    "SuperAdmin",
    "Agent",
    "Builder",
    "Property Owner",
] as const;

export type UserRole =
    (typeof USER_ROLES)[number];

export const ADMIN_ROLES = [
    "Admin",
    "SuperAdmin",
] as const;

export type AdminRole =
    (typeof ADMIN_ROLES)[number];

export function isAdminRole(
    value: unknown,
): value is AdminRole {
    return (
        value === "Admin" ||
        value === "SuperAdmin"
    );
}