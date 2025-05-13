import { NextResponse } from 'next/server'
import Servico from '@/models/Servico'

// Simulando um banco de dados com um array
let services = [
  {
    id: '1',
    name: 'Manicure',
    duration: 60, // duração em minutos
    price: 50.00,
    description: 'Manicure completa com esmaltação',
    category: 'unhas'
  },
  {
    id: '2',
    name: 'Corte de Cabelo',
    duration: 45,
    price: 80.00,
    description: 'Corte, lavagem e finalização',
    category: 'cabelo'
  },
  {
    id: '3',
    name: 'Massagem Relaxante',
    duration: 60,
    price: 120.00,
    description: 'Massagem relaxante de corpo inteiro',
    category: 'massagem'
  }
]

// GET /api/services
export async function GET() {
  try {
    const servicos = await Servico.findAll()
    return NextResponse.json(servicos)
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar serviços' },
      { status: 500 }
    )
  }
}

// POST /api/services
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const servico = await Servico.create(data)
    return NextResponse.json(servico, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar serviço:', error)
    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    )
  }
}

// PUT /api/services/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const id = params.id
  
  const index = services.findIndex(service => service.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Serviço não encontrado' },
      { status: 404 }
    )
  }
  
  // Verificar se o novo nome já existe em outro serviço
  if (body.name) {
    const nameExists = services.some(
      service => 
        service.id !== id && 
        service.name.toLowerCase() === body.name.toLowerCase()
    )
    if (nameExists) {
      return NextResponse.json(
        { error: 'Nome de serviço já cadastrado' },
        { status: 400 }
      )
    }
  }
  
  services[index] = { 
    ...services[index], 
    ...body,
    price: body.price ? Number(body.price) : services[index].price,
    duration: body.duration ? Number(body.duration) : services[index].duration
  }
  
  return NextResponse.json(services[index])
}

// DELETE /api/services/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  const index = services.findIndex(service => service.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Serviço não encontrado' },
      { status: 404 }
    )
  }
  
  services = services.filter(service => service.id !== id)
  
  return NextResponse.json({ message: 'Serviço excluído com sucesso' })
} 