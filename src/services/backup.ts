import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { logger } from '../utils/logger'
import { useLogger } from './logger'

const execAsync = promisify(exec)

interface BackupConfig {
  schedule: string // Cron expression
  retentionDays: number
  compression: boolean
  storagePath: string
}

interface BackupMetadata {
  id: string
  timestamp: Date
  size: number
  status: 'success' | 'failed'
  error?: string
}

class BackupService {
  private static instance: BackupService
  private config: BackupConfig
  private isRunning: boolean = false
  private lastBackup: BackupMetadata | null = null

  private constructor() {
    this.config = {
      schedule: '0 0 * * *', // Diário à meia-noite
      retentionDays: 30,
      compression: true,
      storagePath: process.env.BACKUP_PATH || path.join(process.cwd(), 'backups')
    }
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService()
    }
    return BackupService.instance
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.config.storagePath)) {
      await fs.promises.mkdir(this.config.storagePath, { recursive: true })
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    const files = await fs.promises.readdir(this.config.storagePath)
    const now = new Date()

    for (const file of files) {
      const filePath = path.join(this.config.storagePath, file)
      const stats = await fs.promises.stat(filePath)
      const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)

      if (fileAge > this.config.retentionDays) {
        await fs.promises.unlink(filePath)
        await logger.info('backup_cleanup', `Backup antigo removido: ${file}`)
      }
    }
  }

  private async compressBackup(filePath: string): Promise<string> {
    const compressedPath = `${filePath}.gz`
    await execAsync(`gzip ${filePath}`)
    return compressedPath
  }

  async createBackup(): Promise<BackupMetadata> {
    if (this.isRunning) {
      throw new Error('Backup já está em andamento')
    }

    this.isRunning = true
    const { log } = useLogger()
    const timestamp = new Date()
    const backupId = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}`
    const backupPath = path.join(this.config.storagePath, backupId)

    try {
      await this.ensureBackupDirectory()

      // Em produção, substitua pelo comando real do seu banco de dados
      const dumpCommand = process.env.NODE_ENV === 'production'
        ? `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} > ${backupPath}`
        : `echo "Simulação de backup" > ${backupPath}`

      await execAsync(dumpCommand)
      await log('info', 'backup_created', 'Backup criado com sucesso', 'success')

      let finalPath = backupPath
      if (this.config.compression) {
        finalPath = await this.compressBackup(backupPath)
      }

      const stats = await fs.promises.stat(finalPath)
      this.lastBackup = {
        id: backupId,
        timestamp,
        size: stats.size,
        status: 'success'
      }

      await this.cleanupOldBackups()
      return this.lastBackup
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      await log('error', 'backup_failed', `Falha ao criar backup: ${errorMessage}`, 'failure')
      
      this.lastBackup = {
        id: backupId,
        timestamp,
        size: 0,
        status: 'failed',
        error: errorMessage
      }
      
      throw error
    } finally {
      this.isRunning = false
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    const { log } = useLogger()
    const backupPath = path.join(this.config.storagePath, backupId)
    const isCompressed = backupId.endsWith('.gz')

    try {
      let restorePath = backupPath
      if (isCompressed) {
        await execAsync(`gunzip -k ${backupPath}`)
        restorePath = backupPath.replace('.gz', '')
      }

      // Em produção, substitua pelo comando real do seu banco de dados
      const restoreCommand = process.env.NODE_ENV === 'production'
        ? `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME} < ${restorePath}`
        : `echo "Simulação de restauração"`

      await execAsync(restoreCommand)
      await log('info', 'backup_restored', 'Backup restaurado com sucesso', 'success')

      if (isCompressed) {
        await fs.promises.unlink(restorePath)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      await log('error', 'restore_failed', `Falha ao restaurar backup: ${errorMessage}`, 'failure')
      throw error
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    await this.ensureBackupDirectory()
    const files = await fs.promises.readdir(this.config.storagePath)
    const backups: BackupMetadata[] = []

    for (const file of files) {
      const filePath = path.join(this.config.storagePath, file)
      const stats = await fs.promises.stat(filePath)
      const backupId = file.replace('.gz', '')

      backups.push({
        id: backupId,
        timestamp: stats.mtime,
        size: stats.size,
        status: 'success'
      })
    }

    return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getLastBackup(): BackupMetadata | null {
    return this.lastBackup
  }

  getConfig(): BackupConfig {
    return { ...this.config }
  }

  async updateConfig(newConfig: Partial<BackupConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig }
    await this.ensureBackupDirectory()
  }
}

export const backupService = BackupService.getInstance() 