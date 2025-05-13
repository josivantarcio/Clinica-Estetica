// Simulação de integração com WhatsApp
// Em produção, você deve usar uma API real de WhatsApp como Twilio, MessageBird, etc.

interface NotificationData {
  phone: string
  message: string
}

export async function sendWhatsAppNotification(data: NotificationData): Promise<boolean> {
  try {
    // Aqui você deve implementar a integração real com a API do WhatsApp
    console.log('Enviando mensagem WhatsApp:', {
      to: data.phone,
      message: data.message
    })
    
    // Simulando sucesso
    return true
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return false
  }
}

export function generateAppointmentConfirmationMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Seu agendamento para ${service} foi confirmado para ${new Date(date).toLocaleDateString('pt-BR')} às ${time}. Aguardamos você!`
}

export function generateAppointmentReminderMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Lembrete: você tem um agendamento para ${service} amanhã (${new Date(date).toLocaleDateString('pt-BR')}) às ${time}. Aguardamos você!`
}

export function generateAppointmentCancellationMessage(
  clientName: string,
  service: string,
  date: string,
  time: string
): string {
  return `Olá ${clientName}! Seu agendamento para ${service} no dia ${new Date(date).toLocaleDateString('pt-BR')} às ${time} foi cancelado. Entre em contato conosco para reagendar.`
} 