import { NextResponse } from 'next/server'
import Categoria from '@/models/Categoria'
import { z } from 'zod'
import Produto from '@/models/Produto'

// Schema de validação para categorias
const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
})

// GET /api/inventory/categories
export async function GET() {
  try {
    const categorias = await Categoria.findAll({
      order: [['nome', 'ASC']],
    })
    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/categories
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validatedData = categoriaSchema.parse(data)
    
    // Verificar se categoria já existe
    const existingCategory = await Categoria.findOne({
      where: { nome: validatedData.nome }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 400 }
      )
    }
    
    const categoria = await Categoria.create(validatedData)
    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/categories/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const validatedData = categoriaSchema.parse(data)
    
    const categoria = await Categoria.findByPk(params.id)
    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }
    
    await categoria.update(validatedData)
    return NextResponse.json(categoria)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/categories/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const categoria = await Categoria.findByPk(params.id)
    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }
    
    // Verificar se existem produtos usando esta categoria
    const produtosCount = await Produto.count({
      where: { categoriaId: params.id }
    })
    
    if (produtosCount > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir categoria com produtos associados' },
        { status: 400 }
      )
    }
    
    await categoria.destroy()
    return NextResponse.json(
      { message: 'Categoria excluída com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir categoria' },
      { status: 500 }
    )
  }
} 