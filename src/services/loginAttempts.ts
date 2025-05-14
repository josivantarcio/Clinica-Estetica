import { useLogger } from './logger'

interface LoginAttempt {
  email: string
  timestamp: number
  ip: string
  success: boolean
}

class LoginAttemptsService {
  private static instance: LoginAttemptsService
  private attempts: Map<string, LoginAttempt[]> = new Map()
  private readonly MAX_ATTEMPTS = 5
  private readonly BLOCK_DURATION = 15 * 60 * 1000 // 15 minutos em milissegundos
  private readonly ATTEMPT_WINDOW = 30 * 60 * 1000 // 30 minutos em milissegundos

  private constructor() {}

  static getInstance(): LoginAttemptsService {
    if (!LoginAttemptsService.instance) {
      LoginAttemptsService.instance = new LoginAttemptsService()
    }
    return LoginAttemptsService.instance
  }

  private getAttemptsKey(email: string, ip: string): string {
    return `${email}:${ip}`
  }

  private cleanupOldAttempts(attempts: LoginAttempt[]): LoginAttempt[] {
    const now = Date.now()
    return attempts.filter(
      attempt => now - attempt.timestamp < this.ATTEMPT_WINDOW
    )
  }

  async recordAttempt(email: string, ip: string, success: boolean): Promise<void> {
    const key = this.getAttemptsKey(email, ip)
    const now = Date.now()
    
    const attempts = this.attempts.get(key) || []
    attempts.push({ email, ip, timestamp: now, success })
    
    // Limpa tentativas antigas
    const cleanedAttempts = this.cleanupOldAttempts(attempts)
    this.attempts.set(key, cleanedAttempts)
  }

  async isBlocked(email: string, ip: string): Promise<boolean> {
    const key = this.getAttemptsKey(email, ip)
    const attempts = this.attempts.get(key) || []
    const now = Date.now()

    // Limpa tentativas antigas
    const cleanedAttempts = this.cleanupOldAttempts(attempts)
    this.attempts.set(key, cleanedAttempts)

    // Conta tentativas falhas recentes
    const failedAttempts = cleanedAttempts.filter(
      attempt => !attempt.success && now - attempt.timestamp < this.BLOCK_DURATION
    )

    return failedAttempts.length >= this.MAX_ATTEMPTS
  }

  async getRemainingAttempts(email: string, ip: string): Promise<number> {
    const key = this.getAttemptsKey(email, ip)
    const attempts = this.attempts.get(key) || []
    const now = Date.now()

    // Limpa tentativas antigas
    const cleanedAttempts = this.cleanupOldAttempts(attempts)
    this.attempts.set(key, cleanedAttempts)

    // Conta tentativas falhas recentes
    const failedAttempts = cleanedAttempts.filter(
      attempt => !attempt.success && now - attempt.timestamp < this.BLOCK_DURATION
    )

    return Math.max(0, this.MAX_ATTEMPTS - failedAttempts.length)
  }

  async getBlockTimeRemaining(email: string, ip: string): Promise<number> {
    const key = this.getAttemptsKey(email, ip)
    const attempts = this.attempts.get(key) || []
    const now = Date.now()

    // Encontra a tentativa mais recente
    const lastAttempt = attempts
      .filter(attempt => !attempt.success)
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (!lastAttempt) return 0

    const timeElapsed = now - lastAttempt.timestamp
    return Math.max(0, this.BLOCK_DURATION - timeElapsed)
  }
}

export const loginAttemptsService = LoginAttemptsService.getInstance()

// Hook para usar o serviço de tentativas de login
export function useLoginAttempts() {
  const { log } = useLogger()

  const recordAttempt = async (email: string, ip: string, success: boolean): Promise<void> => {
    try {
      await loginAttemptsService.recordAttempt(email, ip, success)
      if (!success) {
        await log('warning', 'login_attempt_failed', `Tentativa de login falhou para ${email}`, 'failure')
      }
    } catch (error) {
      await log('error', 'login_attempt_error', error.message, 'failure')
    }
  }

  const isBlocked = async (email: string, ip: string): Promise<boolean> => {
    try {
      return await loginAttemptsService.isBlocked(email, ip)
    } catch (error) {
      await log('error', 'login_block_check_error', error.message, 'failure')
      return false
    }
  }

  const getRemainingAttempts = async (email: string, ip: string): Promise<number> => {
    try {
      return await loginAttemptsService.getRemainingAttempts(email, ip)
    } catch (error) {
      await log('error', 'login_attempts_check_error', error.message, 'failure')
      return 0
    }
  }

  const getBlockTimeRemaining = async (email: string, ip: string): Promise<number> => {
    try {
      return await loginAttemptsService.getBlockTimeRemaining(email, ip)
    } catch (error) {
      await log('error', 'login_block_time_check_error', error.message, 'failure')
      return 0
    }
  }

  return {
    recordAttempt,
    isBlocked,
    getRemainingAttempts,
    getBlockTimeRemaining
  }
} 