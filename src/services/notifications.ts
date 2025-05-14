// Simulação de integração com WhatsApp
// Em produção, você deve usar uma API real de WhatsApp como Twilio, MessageBird, etc.

import { whatsappService } from './whatsapp';
import { logger } from '../utils/logger';
import { useAuth } from '@/contexts/AuthContext'
import { useLogger } from './logger'

interface NotificationData {
  phone: string
  message: string
}

export async function sendWhatsAppNotification(data: NotificationData): Promise<boolean> {
  try {
    await whatsappService.enviarMensagem(data.phone, data.message);
    return true;
  } catch (error) {
    logger.error('Erro ao enviar notificação WhatsApp:', error);
    return false;
  }
}

export function generateAppointmentConfirmationMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Seu agendamento para ${service} foi confirmado para ${new Date(date).toLocaleDateString('pt-BR')} às ${time}. Aguardamos você!`;
}

export function generateAppointmentReminderMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Lembrete: você tem um agendamento para ${service} amanhã (${new Date(date).toLocaleDateString('pt-BR')}) às ${time}. Aguardamos você!`;
}

export function generateAppointmentCancellationMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Seu agendamento para ${service} no dia ${new Date(date).toLocaleDateString('pt-BR')} às ${time} foi cancelado. Entre em contato conosco para reagendar.`;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationPriority = 'low' | 'medium' | 'high'
export type NotificationCategory = 'system' | 'appointment' | 'inventory' | 'service' | 'user'

interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  category: NotificationCategory
  title: string
  message: string
  userId?: string
  read: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Map<string, Notification[]> = new Map()
  private readonly MAX_NOTIFICATIONS = 100

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private cleanupOldNotifications(userId: string): void {
    const userNotifications = this.notifications.get(userId) || []
    if (userNotifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications.set(
        userId,
        userNotifications.slice(-this.MAX_NOTIFICATIONS)
      )
    }
  }

  async createNotification(
    type: NotificationType,
    priority: NotificationPriority,
    category: NotificationCategory,
    title: string,
    message: string,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { log } = useLogger()
    const notification: Notification = {
      id: this.generateId(),
      type,
      priority,
      category,
      title,
      message,
      userId,
      read: false,
      createdAt: new Date(),
      metadata
    }

    if (userId) {
      const userNotifications = this.notifications.get(userId) || []
      userNotifications.push(notification)
      this.notifications.set(userId, userNotifications)
      this.cleanupOldNotifications(userId)
    }

    // Em produção, salvar no banco de dados
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        })
      } catch (error) {
        console.error('Erro ao salvar notificação:', error)
      }
    }

    await log('info', 'notification_created', `Notificação criada: ${title}`, 'success')
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.notifications.get(userId) || []
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notifications = this.notifications.get(userId) || []
    const notification = notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.notifications.set(userId, notifications)
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = this.notifications.get(userId) || []
    notifications.forEach(n => n.read = true)
    this.notifications.set(userId, notifications)
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notifications = this.notifications.get(userId) || []
    const filteredNotifications = notifications.filter(n => n.id !== notificationId)
    this.notifications.set(userId, filteredNotifications)
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = this.notifications.get(userId) || []
    return notifications.filter(n => !n.read).length
  }
}

export const notificationService = NotificationService.getInstance()

// Hook para usar o serviço de notificações
export function useNotifications() {
  const { user } = useAuth()
  const { log } = useLogger()

  const createNotification = async (
    type: NotificationType,
    priority: NotificationPriority,
    category: NotificationCategory,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      await notificationService.createNotification(
        type,
        priority,
        category,
        title,
        message,
        user?.id,
        metadata
      )
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
    }
  }

  const getNotifications = async (): Promise<Notification[]> => {
    try {
      return await notificationService.getNotifications(user?.id || '')
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
      return []
    }
  }

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.markAsRead(notificationId, user?.id || '')
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    try {
      await notificationService.markAllAsRead(user?.id || '')
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
    }
  }

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await notificationService.deleteNotification(notificationId, user?.id || '')
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
    }
  }

  const getUnreadCount = async (): Promise<number> => {
    try {
      return await notificationService.getUnreadCount(user?.id || '')
    } catch (error) {
      await log('error', 'notification_error', error.message, 'failure')
      return 0
    }
  }

  return {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  }
}