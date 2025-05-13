import { NextResponse } from 'next/server'
import Cliente from '@/models/Cliente'

// Simulando um banco de dados com um array
let clients = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-01',
    address: 'Rua das Flores, 123',
    notes: 'Cliente preferencial'
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@email.com',
    phone: '(11) 98888-8888',
    birthDate: '1985-05-15',
    address: 'Av. Principal, 456',
    notes: ''
  }
]

// GET /api/clients
export async function GET() {
  try {
    const clientes = await Cliente.findAll()
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

// POST /api/clients
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const cliente = await Cliente.create(data)
    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}

// PUT /api/clients/:id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const id = params.id
  
  const index = clients.findIndex(client => client.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 }
    )
  }
  
  // Verificar se o novo email já existe em outro cliente
  if (body.email) {
    const emailExists = clients.some(
      client => client.id !== id && client.email === body.email
    )
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }
  }
  
  clients[index] = { ...clients[index], ...body }
  
  return NextResponse.json(clients[index])
}

// DELETE /api/clients/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  const index = clients.findIndex(client => client.id === id)
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 }
    )
  }
  
  clients = clients.filter(client => client.id !== id)
  
  return NextResponse.json({ message: 'Cliente excluído com sucesso' })
} 