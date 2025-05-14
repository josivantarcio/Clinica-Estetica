import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Gera um token JWT
    const token = sign(
      { userId, type: '2fa_session' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Erro ao gerar sessão 2FA:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar sessão 2FA' },
      { status: 500 }
    )
  }
} 