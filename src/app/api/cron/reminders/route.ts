import { NextResponse } from 'next/server'
import { sendWhatsAppNotification, generateAppointmentReminderMessage } from '@/services/notifications'

// Simulando um banco de dados com um array
let appointments = [
  {
    id: '1',
    clientName: 'Maria Silva',
    clientPhone: '(11) 99999-9999',
    service: 'Manicure',
    date: '2024-03-20',
    time: '14:00',
    status: 'confirmed',
    notes: 'Cliente preferencial'
  },
  {
    id: '2',
    clientName: 'João Santos',
    clientPhone: '(11) 98888-8888',
    service: 'Corte de Cabelo',
    date: '2024-03-20',
    time: '15:30',
    status: 'pending'
  }
]

// GET /api/cron/reminders
// Este endpoint deve ser chamado por um cron job diariamente
export async function GET() {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    // Buscar agendamentos confirmados para amanhã
    const tomorrowAppointments = appointments.filter(
      app => app.date === tomorrowStr && app.status === 'confirmed'
    )
    
    // Enviar lembretes
    const notifications = tomorrowAppointments.map(async (appointment) => {
      const message = generateAppointmentReminderMessage(
        appointment.clientName,
        appointment.service,
        appointment.date,
        appointment.time
      )
      
      return sendWhatsAppNotification({
        phone: appointment.clientPhone,
        message
      })
    })
    
    await Promise.all(notifications)
    
    return NextResponse.json({
      message: 'Lembretes enviados com sucesso',
      count: tomorrowAppointments.length
    })
  } catch (error) {
    console.error('Erro ao enviar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar lembretes' },
      { status: 500 }
    )
  }
} 