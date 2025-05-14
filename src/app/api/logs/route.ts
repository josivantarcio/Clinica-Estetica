import { NextRequest, NextResponse } from 'next/server'
import { loggerService } from '@/services/logger'
import { useAuth } from '@/contexts/AuthContext'

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json()
    await loggerService.log(
      logEntry.level,
      logEntry.action,
      logEntry.description,
      logEntry.status,
      logEntry.metadata
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar log:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar log' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      level: searchParams.get('level') as any,
      category: searchParams.get('category') as any,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      userId: searchParams.get('userId') || undefined
    }

    const logs = await loggerService.getLogs(filters)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    await loggerService.clearLogs()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao limpar logs:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar logs' },
      { status: 500 }
    )
  }
} 