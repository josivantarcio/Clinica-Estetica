import { NextResponse } from 'next/server'
import Produto from '@/models/Produto'
import { z } from 'zod'

// Schema de validação para produtos
const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  quantidade: z.number().min(0, 'Quantidade não pode ser negativa'),
  minQuantidade: z.number().min(0, 'Quantidade mínima não pode ser negativa'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  preco: z.number().min(0, 'Preço não pode ser negativo'),
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
})

// GET /api/inventory
export async function GET() {
  try {
    const produtos = await Produto.findAll({
      order: [['nome', 'ASC']],
    })
    return NextResponse.json(produtos)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST /api/inventory
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validar dados
    const validatedData = produtoSchema.parse(data)
    
    // Verificar se produto já existe
    const existingProduct = await Produto.findOne({
      where: { nome: validatedData.nome }
    })
    
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Produto já existe' },
        { status: 400 }
      )
    }
    
    const produto = await Produto.create(validatedData)
    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const validatedData = produtoSchema.parse(data)
    
    const produto = await Produto.findByPk(params.id)
    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }
    
    await produto.update(validatedData)
    return NextResponse.json(produto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const produto = await Produto.findByPk(params.id)
    if (!produto) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }
    
    await produto.destroy()
    return NextResponse.json(
      { message: 'Produto excluído com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    )
  }
} 