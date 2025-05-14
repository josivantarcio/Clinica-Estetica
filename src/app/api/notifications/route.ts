import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/services/notifications'
import { useAuth } from '@/contexts/AuthContext'

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    await notificationService.createNotification(
      notification.type,
      notification.priority,
      notification.category,
      notification.title,
      notification.message,
      notification.userId,
      notification.metadata
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const notifications = await notificationService.getNotifications(user.id)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = useAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { notificationId, action } = await request.json()

    switch (action) {
      case 'markAsRead':
        await notificationService.markAsRead(notificationId, user.id)
        break
      case 'markAllAsRead':
        await notificationService.markAllAsRead(user.id)
        break
      case 'delete':
        await notificationService.deleteNotification(notificationId, user.id)
        break
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar notificação' },
      { status: 500 }
    )
  }
} 