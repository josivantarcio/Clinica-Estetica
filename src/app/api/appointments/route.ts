import { NextResponse } from 'next/server'
import { 
  sendWhatsAppNotification, 
  generateAppointmentConfirmationMessage,
  generateAppointmentCancellationMessage
} from '@/services/notifications'

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

// GET /api/appointments
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const service = searchParams.get('service')
  const status = searchParams.get('status')
  const clientName = searchParams.get('clientName')
  
  let filteredAppointments = appointments
  
  if (startDate) {
    filteredAppointments = filteredAppointments.filter(
      app => app.date >= startDate
    )
  }
  
  if (endDate) {
    filteredAppointments = filteredAppointments.filter(
      app => app.date <= endDate
    )
  }
  
  if (service) {
    filteredAppointments = filteredAppointments.filter(
      app => app.service === service
    )
  }
  
  if (status) {
    filteredAppointments = filteredAppointments.filter(
      app => app.status === status
    )
  }
  
  if (clientName) {
    const searchTerm = clientName.toLowerCase()
    filteredAppointments = filteredAppointments.filter(
      app => app.clientName.toLowerCase().includes(searchTerm)
    )
  }
  
  return NextResponse.json(filteredAppointments)
}

// POST /api/appointments
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validação básica
  if (!body.clientName || !body.service || !body.date || !body.time || !body.clientPhone) {
    return NextResponse.json(
      { error: 'Dados incompletos' },
      { status: 400 }
    )
  }
  
  // Verificar disponibilidade do horário
  const isTimeAvailable = !appointments.some(
    app => app.date === body.date && app.time === body.time
  )
  
  if (!isTimeAvailable) {
    return NextResponse.json(
      { error: 'Horário não disponível' },
      { status: 400 }
    )
  }
  
  const newAppointment = {
    id: Date.now().toString(),
    ...body,
    status: 'pending'
  }
  
  appointments.push(newAppointment)
  
  // Enviar confirmação por WhatsApp
  const message = generateAppointmentConfirmationMessage(
    body.clientName,
    body.service,
    body.date,
    body.time
  )
  
  await sendWhatsAppNotification({
    phone: body.clientPhone,
    message
  })
  
  return NextResponse.json(newAppointment, { status: 201 })
}

// PUT /api/appointments/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const id = params.id
  
  const index = appointments.findIndex(app => app.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Agendamento não encontrado' },
      { status: 404 }
    )
  }
  
  // Verificar disponibilidade do novo horário
  if (body.date && body.time) {
    const isTimeAvailable = !appointments.some(
      app => app.id !== id && app.date === body.date && app.time === body.time
    )
    
    if (!isTimeAvailable) {
      return NextResponse.json(
        { error: 'Horário não disponível' },
        { status: 400 }
      )
    }
  }
  
  const oldStatus = appointments[index].status
  appointments[index] = { ...appointments[index], ...body }
  
  // Se o status mudou para cancelado, enviar notificação
  if (body.status === 'cancelled' && oldStatus !== 'cancelled') {
    const message = generateAppointmentCancellationMessage(
      appointments[index].clientName,
      appointments[index].service,
      appointments[index].date,
      appointments[index].time
    )
    
    await sendWhatsAppNotification({
      phone: appointments[index].clientPhone,
      message
    })
  }
  
  return NextResponse.json(appointments[index])
}

// DELETE /api/appointments/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  const index = appointments.findIndex(app => app.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Agendamento não encontrado' },
      { status: 404 }
    )
  }
  
  const appointment = appointments[index]
  appointments = appointments.filter(app => app.id !== id)
  
  // Enviar notificação de cancelamento
  const message = generateAppointmentCancellationMessage(
    appointment.clientName,
    appointment.service,
    appointment.date,
    appointment.time
  )
  
  await sendWhatsAppNotification({
    phone: appointment.clientPhone,
    message
  })
  
  return NextResponse.json({ message: 'Agendamento excluído com sucesso' })
} 