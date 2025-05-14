import { NextRequest, NextResponse } from 'next/server'
import { useAuth } from '@/contexts/AuthContext'

// Simula um banco de dados em memória (em produção, use um banco de dados real)
const twoFactorSecrets: Record<string, string> = {}

export async function POST(request: NextRequest) {
  try {
    const { userId, secret } = await request.json()

    // Salva o segredo
    twoFactorSecrets[userId] = secret

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error)
    return NextResponse.json(
      { error: 'Erro ao configurar 2FA' },
      { status: 500 }
    )
  }
} 