import { NextResponse } from 'next/server'
import Cliente from '@/models/Cliente'
import { z } from 'zod'
import { Op } from 'sequelize'

// Schema de validação para programa de fidelidade
const loyaltySchema = z.object({
  clienteId: z.string().uuid('ID do cliente inválido'),
  pontos: z.number().min(0, 'Pontos não podem ser negativos'),
  nivel: z.enum(['Bronze', 'Prata', 'Ouro', 'Diamante'], {
    errorMap: () => ({ message: 'Nível inválido' })
  }),
  totalGasto: z.number().min(0, 'Total gasto não pode ser negativo'),
})

type Nivel = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante'

// GET /api/loyalty
export async function GET() {
  try {
    const clientes = await Cliente.findAll({
      attributes: [
        'id',
        'nome',
        'pontos',
        'nivel',
        'totalGasto',
      ],
      where: {
        pontos: {
          [Op.gt]: 0 // Apenas clientes com pontos
        }
      },
      order: [
        ['pontos', 'DESC'],
        ['nome', 'ASC']
      ]
    })

    // Calcular próximo nível e pontos necessários
    const clientesComProximosNiveis = clientes.map(cliente => {
      const niveis: Nivel[] = ['Bronze', 'Prata', 'Ouro', 'Diamante']
      const nivelAtualIndex = niveis.indexOf(cliente.nivel)
      const proximoNivel = nivelAtualIndex < niveis.length - 1 ? niveis[nivelAtualIndex + 1] : null
      
      // Pontos necessários para próximo nível
      const pontosNecessarios: Record<Nivel, number | null> = {
        'Bronze': 500,
        'Prata': 1000,
        'Ouro': 2000,
        'Diamante': null
      }

      return {
        ...cliente.toJSON(),
        proximoNivel,
        pontosParaProximoNivel: proximoNivel ? pontosNecessarios[proximoNivel] - cliente.pontos : null
      }
    })

    return NextResponse.json(clientesComProximosNiveis)
  } catch (error: unknown) {
    console.error('Erro ao buscar programa de fidelidade:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar programa de fidelidade' },
      { status: 500 }
    )
  }
}

// POST /api/loyalty
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validatedData = loyaltySchema.parse(data)
    
    // Verificar se cliente existe
    const cliente = await Cliente.findByPk(validatedData.clienteId)
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    // Atualizar pontos e nível do cliente
    await cliente.update({
      pontos: validatedData.pontos,
      nivel: validatedData.nivel,
      totalGasto: validatedData.totalGasto
    })
    
    return NextResponse.json(cliente, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar programa de fidelidade:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar programa de fidelidade' },
      { status: 500 }
    )
  }
}

// PUT /api/loyalty/[clienteId]/points
export async function PUT(request: Request, { params }: { params: { clienteId: string } }) {
  try {
    const data = await request.json()
    const { pontos } = z.object({
      pontos: z.number().min(0, 'Pontos não podem ser negativos')
    }).parse(data)
    
    const cliente = await Cliente.findByPk(params.clienteId)
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    // Atualizar pontos e recalcular nível
    const novosPontos = cliente.pontos + pontos
    const novoNivel = calcularNivel(novosPontos)
    
    await cliente.update({
      pontos: novosPontos,
      nivel: novoNivel
    })
    
    return NextResponse.json(cliente)
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar pontos:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pontos' },
      { status: 500 }
    )
  }
}

// Função auxiliar para calcular nível baseado nos pontos
function calcularNivel(pontos: number): Nivel {
  if (pontos >= 2000) return 'Diamante'
  if (pontos >= 1000) return 'Ouro'
  if (pontos >= 500) return 'Prata'
  return 'Bronze'
} 