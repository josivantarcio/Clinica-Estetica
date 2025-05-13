import { NextResponse } from 'next/server'

// Simulando um banco de dados de categorias
let categories = [
  {
    id: '1',
    name: 'Cabelo',
  },
  {
    id: '2',
    name: 'Corpo',
  },
  {
    id: '3',
    name: 'Rosto',
  },
  {
    id: '4',
    name: 'Unhas',
  },
  {
    id: '5',
    name: 'Maquiagem',
  },
]

// GET /api/inventory/categories
export async function GET() {
  return NextResponse.json(categories)
}

// POST /api/inventory/categories
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a categoria já existe
    const categoryExists = categories.some(
      c => c.name.toLowerCase() === data.name.toLowerCase()
    )

    if (categoryExists) {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 400 }
      )
    }

    // Criar nova categoria
    const newCategory = {
      id: Date.now().toString(),
      name: data.name,
    }

    categories.push(newCategory)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/categories/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    const categoryIndex = categories.findIndex(c => c.id === params.id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o novo nome já existe em outra categoria
    const nameExists = categories.some(
      c => c.id !== params.id && c.name.toLowerCase() === data.name.toLowerCase()
    )

    if (nameExists) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 400 }
      )
    }

    // Atualizar categoria
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: data.name,
    }

    return NextResponse.json(categories[categoryIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/categories/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const categoryIndex = categories.findIndex(c => c.id === params.id)

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    // Remover categoria
    categories = categories.filter(c => c.id !== params.id)
    return NextResponse.json({ message: 'Categoria removida com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao remover categoria' },
      { status: 500 }
    )
  }
} 