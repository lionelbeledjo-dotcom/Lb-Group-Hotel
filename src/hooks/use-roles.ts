import { useRouteContext } from "@tanstack/react-router";

export function useRoles() {
  const ctx = useRouteContext({ from: "/_authenticated" });
  const roles: string[] = (ctx as any).roles ?? [];
  return {
    roles,
    isAdmin: roles.includes("super_admin") || roles.includes("admin"),
    isReceptionist: roles.includes("receptionist") || roles.includes("admin") || roles.includes("super_admin"),
    isHousekeeper: roles.includes("housekeeper") || roles.includes("admin") || roles.includes("super_admin"),
    isMaintenance: roles.includes("maintenance") || roles.includes("admin") || roles.includes("super_admin"),
    hasAnyRole: roles.length > 0,
  };
}
