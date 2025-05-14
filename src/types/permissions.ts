export type Permission = 
  | 'view_dashboard'
  | 'manage_appointments'
  | 'view_appointments'
  | 'manage_services'
  | 'view_services'
  | 'manage_inventory'
  | 'view_inventory'
  | 'manage_clients'
  | 'view_clients'
  | 'manage_employees'
  | 'view_employees'
  | 'manage_reports'
  | 'view_reports'
  | 'manage_settings'
  | 'view_settings'
  | 'manage_profile'
  | 'view_profile'

export type Role = 'admin' | 'manager' | 'employee' | 'receptionist'

export interface RolePermissions {
  role: Role
  permissions: Permission[]
}

// Mapeamento de funções para permissões
export const rolePermissionsMap: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_appointments',
    'view_appointments',
    'manage_services',
    'view_services',
    'manage_inventory',
    'view_inventory',
    'manage_clients',
    'view_clients',
    'manage_employees',
    'view_employees',
    'manage_reports',
    'view_reports',
    'manage_settings',
    'view_settings',
    'manage_profile',
    'view_profile'
  ],
  manager: [
    'view_dashboard',
    'manage_appointments',
    'view_appointments',
    'manage_services',
    'view_services',
    'manage_inventory',
    'view_inventory',
    'manage_clients',
    'view_clients',
    'view_employees',
    'manage_reports',
    'view_reports',
    'view_settings',
    'manage_profile',
    'view_profile'
  ],
  employee: [
    'view_dashboard',
    'view_appointments',
    'view_services',
    'view_inventory',
    'view_clients',
    'view_reports',
    'manage_profile',
    'view_profile'
  ],
  receptionist: [
    'view_dashboard',
    'manage_appointments',
    'view_appointments',
    'view_services',
    'view_inventory',
    'manage_clients',
    'view_clients',
    'view_reports',
    'manage_profile',
    'view_profile'
  ]
} 