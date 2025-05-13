import { NextResponse } from 'next/server'

// Simulando um banco de dados com arrays
let loyaltyPrograms = [
  {
    id: '1',
    name: 'Maria Silva',
    points: 750,
    level: 'Prata',
    totalSpent: 1500.00,
    nextLevel: 'Ouro',
    pointsToNextLevel: 1000
  },
  {
    id: '2',
    name: 'João Santos',
    points: 1200,
    level: 'Ouro',
    totalSpent: 2400.00,
    nextLevel: 'Diamante',
    pointsToNextLevel: 2000
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    points: 450,
    level: 'Bronze',
    totalSpent: 900.00,
    nextLevel: 'Prata',
    pointsToNextLevel: 500
  }
]

// GET /api/loyalty
export async function GET() {
  return NextResponse.json(loyaltyPrograms)
}

// POST /api/loyalty
export async function POST(request: Request) {
  const body = await request.json()
  
  // Validação básica
  if (!body.clientId || !body.points) {
    return NextResponse.json(
      { error: 'Dados incompletos' },
      { status: 400 }
    )
  }
  
  // Atualizar pontos do cliente
  const program = loyaltyPrograms.find(p => p.id === body.clientId)
  if (!program) {
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 }
    )
  }
  
  program.points += body.points
  
  // Atualizar nível
  if (program.points >= 2000) {
    program.level = 'Diamante'
    program.nextLevel = 'Diamante'
    program.pointsToNextLevel = 2000
  } else if (program.points >= 1000) {
    program.level = 'Ouro'
    program.nextLevel = 'Diamante'
    program.pointsToNextLevel = 2000
  } else if (program.points >= 500) {
    program.level = 'Prata'
    program.nextLevel = 'Ouro'
    program.pointsToNextLevel = 1000
  } else {
    program.level = 'Bronze'
    program.nextLevel = 'Prata'
    program.pointsToNextLevel = 500
  }
  
  return NextResponse.json(program)
} 