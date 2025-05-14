import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { Permission } from '@/types/permissions'

interface PermissionGuardProps {
  children: ReactNode
  permissions: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null
}: PermissionGuardProps) {
  const router = useRouter()
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.push('/dashboard')
    return null
  }

  return <>{children}</>
} 