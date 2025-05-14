import { NextRequest, NextResponse } from 'next/server'
import { loginAttemptsService } from '@/services/loginAttempts'
import { useLogger } from '@/services/logger'

export async function POST(request: NextRequest) {
  const { log } = useLogger()
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  try {
    const { email, password } = await request.json()

    // Verifica se a conta está bloqueada
    const isBlocked = await loginAttemptsService.isBlocked(email, ip)
    if (isBlocked) {
      const blockTimeRemaining = await loginAttemptsService.getBlockTimeRemaining(email, ip)
      const minutesRemaining = Math.ceil(blockTimeRemaining / (60 * 1000))

      await log('warning', 'login_blocked', `Tentativa de login bloqueada para ${email}`, 'failure')
      return NextResponse.json(
        { 
          error: 'Conta bloqueada',
          message: `Muitas tentativas falhas. Tente novamente em ${minutesRemaining} minutos.`
        },
        { status: 429 }
      )
    }

    // Verifica as credenciais
    if (!process.env.API_URL) {
  await log('error', 'config_error', 'API_URL não está definida', 'failure');
  return NextResponse.json(
    { error: 'Configuração inválida' },
    { status: 500 }
  );
}

const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      // Registra tentativa falha
      await loginAttemptsService.recordAttempt(email, ip, false)
      const remainingAttempts = await loginAttemptsService.getRemainingAttempts(email, ip)

      await log('warning', 'login_failed', `Tentativa de login falhou para ${email}`, 'failure')
      return NextResponse.json(
        { 
          error: 'Credenciais inválidas',
          message: `Credenciais inválidas. ${remainingAttempts} tentativas restantes.`
        },
        { status: 401 }
      )
    }

    const data = await response.json()

    // Registra tentativa bem-sucedida
    await loginAttemptsService.recordAttempt(email, ip, true)
    await log('info', 'login_success', `Login bem-sucedido para ${email}`)

    // Configura o cookie de autenticação
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    }

    const finalResponse = NextResponse.json({ success: true })
    finalResponse.cookies.set('auth_token', data.token, cookieOptions)

    return finalResponse
  } catch (error) {
    await log('error', 'login_error', `Erro ao fazer login: ${(error as Error).message}`, 'failure')
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
} 