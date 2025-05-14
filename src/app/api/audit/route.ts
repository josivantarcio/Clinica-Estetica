import { NextRequest, NextResponse } from 'next/server'
import { auditService } from '@/services/audit'
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

    const entry = await request.json()
    await auditService.logAudit(
      entry.action,
      entry.resource,
      entry.details,
      entry.resourceId,
      entry.changes
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar auditoria' },
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

    const { searchParams } = new URL(request.url)
    const filters = {
      userId: searchParams.get('userId') || undefined,
      action: searchParams.get('action') as any || undefined,
      resource: searchParams.get('resource') as any || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    }

    const format = searchParams.get('format')
    if (format === 'csv' || format === 'json') {
      const data = await auditService.exportAuditLogs(format)
      const headers = new Headers()
      headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
      headers.set('Content-Disposition', `attachment; filename=audit-logs.${format}`)
      return new NextResponse(data, { headers })
    }

    const logs = await auditService.getAuditLogs(filters)
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    )
  }
}

export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user } = useAuth()
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const log = await auditService.getAuditLogById(params.id)
    if (!log) {
      return NextResponse.json(
        { error: 'Log não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('Erro ao buscar log de auditoria:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar log de auditoria' },
      { status: 500 }
    )
  }
} 