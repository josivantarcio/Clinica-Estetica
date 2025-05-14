import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { useAuth } from '@/contexts/AuthContext'
import { useLogger } from './logger'

interface TwoFactorSetup {
  secret: string
  qrCode: string
}

interface TwoFactorVerify {
  isValid: boolean
  token: string
}

class TwoFactorAuth {
  private static instance: TwoFactorAuth

  private constructor() {
    // Configura o TOTP
    authenticator.options = {
      window: 1, // Permite 1 período antes/depois para sincronização
      step: 30, // Gera novo código a cada 30 segundos
    }
  }

  static getInstance(): TwoFactorAuth {
    if (!TwoFactorAuth.instance) {
      TwoFactorAuth.instance = new TwoFactorAuth()
    }
    return TwoFactorAuth.instance
  }

  async setup(userId: string, email: string): Promise<TwoFactorSetup> {
    // Gera um segredo único para o usuário
    const secret = authenticator.generateSecret()

    // Gera o QR Code
    const otpauth = authenticator.keyuri(email, 'SalaoEstetica', secret)
    const qrCode = await QRCode.toDataURL(otpauth)

    // Salva o segredo no servidor
    await fetch('/api/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, secret })
    })

    return { secret, qrCode }
  }

  async verify(userId: string, token: string): Promise<TwoFactorVerify> {
    try {
      // Busca o segredo do usuário
      const response = await fetch(`/api/2fa/verify/${userId}`)
      const { secret } = await response.json()

      // Verifica o token
      const isValid = authenticator.verify({ token, secret })

      if (isValid) {
        // Gera um token de sessão
        const sessionToken = await this.generateSessionToken(userId)
        return { isValid: true, token: sessionToken }
      }

      return { isValid: false, token: '' }
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)
      return { isValid: false, token: '' }
    }
  }

  private async generateSessionToken(userId: string): Promise<string> {
    const response = await fetch('/api/2fa/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })

    const { token } = await response.json()
    return token
  }

  async disable(userId: string): Promise<boolean> {
    try {
      await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      return true
    } catch (error) {
      console.error('Erro ao desativar 2FA:', error)
      return false
    }
  }
}

export const twoFactorAuth = TwoFactorAuth.getInstance()

// Hook para usar o 2FA com o contexto de autenticação
export function useTwoFactorAuth() {
  const { user } = useAuth()
  const { log } = useLogger()

  const setup = async (): Promise<TwoFactorSetup | null> => {
    if (!user) return null

    try {
      const setup = await twoFactorAuth.setup(user.id, user.email)
      await log('info', '2fa_setup', '2FA configurado com sucesso')
      return setup
    } catch (error) {
      await log('error', '2fa_setup_failed', error.message, 'failure')
      return null
    }
  }

  const verify = async (token: string): Promise<TwoFactorVerify> => {
    if (!user) return { isValid: false, token: '' }

    try {
      const result = await twoFactorAuth.verify(user.id, token)
      if (result.isValid) {
        await log('info', '2fa_verify', '2FA verificado com sucesso')
      } else {
        await log('warning', '2fa_verify_failed', 'Código 2FA inválido', 'failure')
      }
      return result
    } catch (error) {
      await log('error', '2fa_verify_error', error.message, 'failure')
      return { isValid: false, token: '' }
    }
  }

  const disable = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const success = await twoFactorAuth.disable(user.id)
      if (success) {
        await log('info', '2fa_disable', '2FA desativado com sucesso')
      } else {
        await log('warning', '2fa_disable_failed', 'Falha ao desativar 2FA', 'failure')
      }
      return success
    } catch (error) {
      await log('error', '2fa_disable_error', error.message, 'failure')
      return false
    }
  }

  return {
    setup,
    verify,
    disable
  }
} 