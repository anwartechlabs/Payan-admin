import type { AdminPermission, AdminRole } from './admin'

const permissionsByRole: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: ['dashboard:view', 'riders:review', 'rides:monitor'],
  verification_admin: ['dashboard:view', 'riders:review'],
  operations_admin: ['dashboard:view', 'rides:monitor'],
}

export function hasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return permissionsByRole[role].includes(permission)
}

export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: 'Super administrator',
    verification_admin: 'Verification administrator',
    operations_admin: 'Operations administrator',
  }

  return labels[role]
}
