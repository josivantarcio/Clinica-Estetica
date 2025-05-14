import { NextRequest, NextResponse } from 'next/server'
import { backupService } from '@/services/backup'
import { useAuth } from '@/contexts/AuthContext'

export async function POST(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const backup = await backupService.createBackup()
    return NextResponse.json(backup)
  } catch (error) {
    console.error('Erro ao criar backup:', error)
    return NextResponse.json(
      { error: 'Erro ao criar backup' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const backups = await backupService.listBackups()
    return NextResponse.json(backups)
  } catch (error) {
    console.error('Erro ao listar backups:', error)
    return NextResponse.json(
      { error: 'Erro ao listar backups' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { action, backupId, config } = await request.json()

    switch (action) {
      case 'restore':
        await backupService.restoreBackup(backupId)
        break
      case 'updateConfig':
        await backupService.updateConfig(config)
        break
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao executar ação:', error)
    return NextResponse.json(
      { error: 'Erro ao executar ação' },
      { status: 500 }
    )
  }
} 