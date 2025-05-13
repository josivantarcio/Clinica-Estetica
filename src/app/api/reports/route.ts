import { NextResponse } from 'next/server'

// Simulando um banco de dados com arrays
let appointments = [
  {
    id: '1',
    clientName: 'Maria Silva',
    service: 'Manicure',
    date: '2024-03-20',
    time: '14:00',
    status: 'confirmed',
    price: 50.00
  },
  {
    id: '2',
    clientName: 'João Santos',
    service: 'Corte de Cabelo',
    date: '2024-03-20',
    time: '15:30',
    status: 'pending',
    price: 80.00
  },
  {
    id: '3',
    clientName: 'Ana Oliveira',
    service: 'Massagem Relaxante',
    date: '2024-03-21',
    time: '10:00',
    status: 'confirmed',
    price: 120.00
  }
]

// GET /api/reports
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'
  
  // Calcular datas com base no período
  const endDate = new Date()
  const startDate = new Date()
  
  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }
  
  // Filtrar agendamentos pelo período
  const filteredAppointments = appointments.filter(app => {
    const appointmentDate = new Date(app.date)
    return appointmentDate >= startDate && appointmentDate <= endDate
  })
  
  // Calcular receita total
  const totalRevenue = filteredAppointments.reduce(
    (sum, app) => sum + (app.status === 'confirmed' ? app.price : 0),
    0
  )
  
  // Calcular crescimento da receita (simulado)
  const revenueGrowth = 15 // 15% de crescimento
  
  // Calcular total de agendamentos
  const totalAppointments = filteredAppointments.length
  
  // Calcular crescimento de agendamentos (simulado)
  const appointmentsGrowth = 10 // 10% de crescimento
  
  // Calcular receita por serviço
  const revenueByService = filteredAppointments.reduce((acc, app) => {
    if (app.status === 'confirmed') {
      const existing = acc.find(item => item.service === app.service)
      if (existing) {
        existing.revenue += app.price
      } else {
        acc.push({ service: app.service, revenue: app.price })
      }
    }
    return acc
  }, [] as { service: string; revenue: number }[])
  
  // Calcular agendamentos por status
  const appointmentsByStatus = filteredAppointments.reduce((acc, app) => {
    const existing = acc.find(item => item.status === app.status)
    if (existing) {
      existing.count++
    } else {
      acc.push({ status: app.status, count: 1 })
    }
    return acc
  }, [] as { status: string; count: number }[])
  
  // Calcular receita por mês
  const revenueByMonth = filteredAppointments.reduce((acc, app) => {
    if (app.status === 'confirmed') {
      const month = new Date(app.date).toLocaleString('pt-BR', { month: 'long' })
      const existing = acc.find(item => item.month === month)
      if (existing) {
        existing.revenue += app.price
      } else {
        acc.push({ month, revenue: app.price })
      }
    }
    return acc
  }, [] as { month: string; revenue: number }[])
  
  return NextResponse.json({
    totalRevenue,
    totalAppointments,
    revenueGrowth,
    appointmentsGrowth,
    revenueByService,
    appointmentsByStatus,
    revenueByMonth
  })
} 