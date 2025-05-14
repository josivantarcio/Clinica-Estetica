// Simulação de integração com WhatsApp
// Em produção, você deve usar uma API real de WhatsApp como Twilio, MessageBird, etc.

import { whatsappService } from './whatsapp';
import { logger } from '../utils/logger';

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