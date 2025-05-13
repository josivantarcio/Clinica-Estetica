import { NextResponse } from 'next/server'

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
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  let filteredServices = services
  
  if (category) {
    filteredServices = services.filter(service => service.category === category)
  }
  
  return NextResponse.json(filteredServices)
}

// POST /api/services
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validação básica
  if (!body.name || !body.duration || !body.price || !body.category) {
    return NextResponse.json(
      { error: 'Dados incompletos' },
      { status: 400 }
    )
  }
  
  // Verificar se o serviço já existe
  const serviceExists = services.some(
    service => service.name.toLowerCase() === body.name.toLowerCase()
  )
  
  if (serviceExists) {
    return NextResponse.json(
      { error: 'Serviço já cadastrado' },
      { status: 400 }
    )
  }
  
  const newService = {
    id: Date.now().toString(),
    ...body,
    price: Number(body.price),
    duration: Number(body.duration)
  }
  
  services.push(newService)
  
  return NextResponse.json(newService, { status: 201 })
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