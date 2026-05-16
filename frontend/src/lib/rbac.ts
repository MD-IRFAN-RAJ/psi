export const ADMIN_ROLES = ['ADMIN', 'CTO', 'MANAGER'] as const;
export const SPRINT_ROLES = ['ADMIN', 'CTO', 'MANAGER', 'TEAM_LEAD'] as const;

export const hasAnyRole = (role: string | undefined, allowedRoles: readonly string[]) => {
  if (!role) return false;
  return allowedRoles.includes(role);
};

export const canManageProjects = (role?: string) => hasAnyRole(role, ADMIN_ROLES);
export const canManageSprints = (role?: string) => hasAnyRole(role, SPRINT_ROLES);
