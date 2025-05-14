import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission, Role, rolePermissionsMap } from '@/types/permissions'

export function usePermissions() {
  const { user } = useAuth()

  const userRole = useMemo(() => {
    return user?.cargo as Role || 'employee'
  }, [user?.cargo])

  const userPermissions = useMemo(() => {
    return rolePermissionsMap[userRole] || []
  }, [userRole])

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
} 