import { NextRequest, NextResponse } from 'next/server'

// Simula um banco de dados em memória (em produção, use um banco de dados real)
const twoFactorSecrets: Record<string, string> = {}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Remove o segredo
    delete twoFactorSecrets[userId]

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao desativar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar 2FA' },
      { status: 500 }
    )
  }
} 