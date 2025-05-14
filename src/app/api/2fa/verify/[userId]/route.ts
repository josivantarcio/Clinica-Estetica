import { NextRequest, NextResponse } from 'next/server'

// Simula um banco de dados em memória (em produção, use um banco de dados real)
const twoFactorSecrets: Record<string, string> = {}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const secret = twoFactorSecrets[userId]

    if (!secret) {
      return NextResponse.json(
        { error: '2FA não configurado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ secret })
  } catch (error) {
    console.error('Erro ao verificar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar 2FA' },
      { status: 500 }
    )
  }
} 