import { useAuth } from '@/contexts/AuthContext'

export type LogLevel = 'info' | 'warning' | 'error'
export type LogCategory = 'auth' | 'user' | 'appointment' | 'service' | 'inventory' | 'report' | 'system'
export type LogStatus = 'success' | 'failure' | 'pending'

interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  category: LogCategory
  action: string
  description: string
  status: LogStatus
  userId?: string
  metadata?: Record<string, any>
}

class LoggerService {
  private static instance: LoggerService
  private logs: LogEntry[] = []
  private readonly MAX_LOGS = 1000

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private cleanupOldLogs(): void {
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }
  }

  async log(
    level: LogLevel,
    action: string,
    description: string,
    status: LogStatus = 'success',
    metadata?: Record<string, any>
  ): Promise<void> {
    const { user } = useAuth()
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category: this.getCategoryFromAction(action),
      action,
      description,
      status,
      userId: user?.id,
      metadata
    }

    this.logs.push(logEntry)
    this.cleanupOldLogs()

    // Em produção, salvar no banco de dados
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry)
        })
      } catch (error) {
        console.error('Erro ao salvar log:', error)
      }
    }
  }

  private getCategoryFromAction(action: string): LogCategory {
    if (action.startsWith('auth_') || action.startsWith('login_')) return 'auth'
    if (action.startsWith('user_')) return 'user'
    if (action.startsWith('appointment_')) return 'appointment'
    if (action.startsWith('service_')) return 'service'
    if (action.startsWith('inventory_')) return 'inventory'
    if (action.startsWith('report_')) return 'report'
    return 'system'
  }

  async getLogs(filters?: {
    level?: LogLevel
    category?: LogCategory
    startDate?: Date
    endDate?: Date
    userId?: string
  }): Promise<LogEntry[]> {
    let filteredLogs = [...this.logs]

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level)
      }
      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category)
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async clearLogs(): Promise<void> {
    this.logs = []
  }
}

export const loggerService = LoggerService.getInstance()

// Hook para usar o serviço de logs
export function useLogger() {
  const log = async (
    level: LogLevel,
    action: string,
    description: string,
    status: LogStatus = 'success',
    metadata?: Record<string, any>
  ): Promise<void> => {
    await loggerService.log(level, action, description, status, metadata)
  }

  const getLogs = async (filters?: {
    level?: LogLevel
    category?: LogCategory
    startDate?: Date
    endDate?: Date
    userId?: string
  }): Promise<LogEntry[]> => {
    return await loggerService.getLogs(filters)
  }

  const clearLogs = async (): Promise<void> => {
    await loggerService.clearLogs()
  }

  return {
    log,
    getLogs,
    clearLogs
  }
} 