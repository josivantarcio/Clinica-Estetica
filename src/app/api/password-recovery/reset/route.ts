import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Simula um banco de dados em memória (em produção, use um banco de dados real)
const users: Record<string, { password: string }> = {}

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualiza a senha do usuário
    if (users[userId]) {
      users[userId].password = hashedPassword
    } else {
      users[userId] = { password: hashedPassword }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    )
  }
} 