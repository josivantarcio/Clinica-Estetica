import { useAuth } from '@/contexts/AuthContext'
import { useLogger } from './logger'

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'password_change'
  | 'permission_change'
  | 'backup'
  | 'restore'
  | 'export'
  | 'import'

export type AuditResource = 
  | 'user'
  | 'appointment'
  | 'service'
  | 'product'
  | 'client'
  | 'payment'
  | 'settings'
  | 'backup'
  | 'system'

interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details: string
  ipAddress?: string
  userAgent?: string
  changes?: {
    before: any
    after: any
  }
}

class AuditService {
  private static instance: AuditService
  private entries: AuditEntry[] = []
  private readonly MAX_ENTRIES = 10000

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private cleanupOldEntries(): void {
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES)
    }
  }

  async logAudit(
    action: AuditAction,
    resource: AuditResource,
    details: string,
    resourceId?: string,
    changes?: { before: any; after: any }
  ): Promise<void> {
    const { user } = useAuth()
    const { log } = useLogger()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      resource,
      resourceId,
      details,
      changes
    }

    this.entries.push(entry)
    this.cleanupOldEntries()

    // Em produção, salvar no banco de dados
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
      } catch (error) {
        console.error('Erro ao salvar entrada de auditoria:', error)
      }
    }

    await log('info', 'audit_entry', `Entrada de auditoria: ${action} em ${resource}`, 'success')
  }

  async getAuditLogs(
    filters?: {
      userId?: string
      action?: AuditAction
      resource?: AuditResource
      startDate?: Date
      endDate?: Date
    }
  ): Promise<AuditEntry[]> {
    let filteredEntries = [...this.entries]

    if (filters) {
      if (filters.userId) {
        filteredEntries = filteredEntries.filter(entry => entry.userId === filters.userId)
      }
      if (filters.action) {
        filteredEntries = filteredEntries.filter(entry => entry.action === filters.action)
      }
      if (filters.resource) {
        filteredEntries = filteredEntries.filter(entry => entry.resource === filters.resource)
      }
      if (filters.startDate) {
        filteredEntries = filteredEntries.filter(entry => entry.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredEntries = filteredEntries.filter(entry => entry.timestamp <= filters.endDate!)
      }
    }

    return filteredEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async getAuditLogById(id: string): Promise<AuditEntry | null> {
    return this.entries.find(entry => entry.id === id) || null
  }

  async exportAuditLogs(format: 'csv' | 'json'): Promise<string> {
    const entries = await this.getAuditLogs()

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'User ID', 'User Name', 'User Role', 'Action', 'Resource', 'Resource ID', 'Details']
      const rows = entries.map(entry => [
        entry.id,
        entry.timestamp.toISOString(),
        entry.userId,
        entry.userName,
        entry.userRole,
        entry.action,
        entry.resource,
        entry.resourceId || '',
        entry.details
      ])

      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')
    }

    return JSON.stringify(entries, null, 2)
  }
}

export const auditService = AuditService.getInstance()

// Hook para usar o serviço de auditoria
export function useAudit() {
  const logAudit = async (
    action: AuditAction,
    resource: AuditResource,
    details: string,
    resourceId?: string,
    changes?: { before: any; after: any }
  ): Promise<void> => {
    try {
      await auditService.logAudit(action, resource, details, resourceId, changes)
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error)
    }
  }

  const getAuditLogs = async (filters?: {
    userId?: string
    action?: AuditAction
    resource?: AuditResource
    startDate?: Date
    endDate?: Date
  }): Promise<AuditEntry[]> => {
    try {
      return await auditService.getAuditLogs(filters)
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      return []
    }
  }

  const getAuditLogById = async (id: string): Promise<AuditEntry | null> => {
    try {
      return await auditService.getAuditLogById(id)
    } catch (error) {
      console.error('Erro ao buscar log de auditoria:', error)
      return null
    }
  }

  const exportAuditLogs = async (format: 'csv' | 'json'): Promise<string> => {
    try {
      return await auditService.exportAuditLogs(format)
    } catch (error) {
      console.error('Erro ao exportar logs de auditoria:', error)
      return ''
    }
  }

  return {
    logAudit,
    getAuditLogs,
    getAuditLogById,
    exportAuditLogs
  }
} 