import { sign, verify } from 'jsonwebtoken'
import { useLogger } from './logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const TOKEN_EXPIRATION = '1h'

interface RecoveryToken {
  userId: string
  email: string
  type: 'password_recovery'
  exp: number
}

class PasswordRecovery {
  private static instance: PasswordRecovery

  private constructor() {}

  static getInstance(): PasswordRecovery {
    if (!PasswordRecovery.instance) {
      PasswordRecovery.instance = new PasswordRecovery()
    }
    return PasswordRecovery.instance
  }

  async requestRecovery(email: string): Promise<boolean> {
    try {
      // Busca o usuário pelo email
      const response = await fetch(`/api/users/by-email/${email}`)
      if (!response.ok) return false

      const user = await response.json()

      // Gera um token de recuperação
      const token = sign(
        {
          userId: user.id,
          email: user.email,
          type: 'password_recovery'
        } as RecoveryToken,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      )

      // Envia o email de recuperação
      await fetch('/api/password-recovery/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          token,
          name: user.nome
        })
      })

      return true
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error)
      return false
    }
  }

  async verifyToken(token: string): Promise<{ isValid: boolean; userId?: string }> {
    try {
      const decoded = verify(token, JWT_SECRET) as RecoveryToken
      
      if (decoded.type !== 'password_recovery') {
        return { isValid: false }
      }

      return { isValid: true, userId: decoded.userId }
    } catch (error) {
      return { isValid: false }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const { isValid, userId } = await this.verifyToken(token)
      
      if (!isValid || !userId) {
        return false
      }

      // Atualiza a senha
      const response = await fetch('/api/password-recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword
        })
      })

      return response.ok
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      return false
    }
  }
}

export const passwordRecovery = PasswordRecovery.getInstance()

// Hook para usar a recuperação de senha
export function usePasswordRecovery() {
  const { log } = useLogger()

  const requestRecovery = async (email: string): Promise<boolean> => {
    try {
      const success = await passwordRecovery.requestRecovery(email)
      if (success) {
        await log('info', 'password_recovery_requested', 'Solicitação de recuperação de senha enviada')
      } else {
        await log('warning', 'password_recovery_request_failed', 'Falha ao solicitar recuperação de senha', 'failure')
      }
      return success
    } catch (error) {
      await log('error', 'password_recovery_request_error', error.message, 'failure')
      return false
    }
  }

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const success = await passwordRecovery.resetPassword(token, newPassword)
      if (success) {
        await log('info', 'password_reset_success', 'Senha redefinida com sucesso')
      } else {
        await log('warning', 'password_reset_failed', 'Falha ao redefinir senha', 'failure')
      }
      return success
    } catch (error) {
      await log('error', 'password_reset_error', error.message, 'failure')
      return false
    }
  }

  return {
    requestRecovery,
    resetPassword
  }
} 