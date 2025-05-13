import { NextResponse } from 'next/server'

// Simulando um banco de dados
let products = [
  {
    id: '1',
    name: 'Shampoo Profissional',
    category: 'Cabelo',
    quantity: 15,
    minQuantity: 5,
    unit: 'unidade',
    price: 45.90,
    supplier: 'Distribuidora de Cosméticos LTDA',
    lastRestock: '2024-03-15',
  },
  {
    id: '2',
    name: 'Máscara Capilar',
    category: 'Cabelo',
    quantity: 8,
    minQuantity: 3,
    unit: 'unidade',
    price: 35.50,
    supplier: 'Distribuidora de Cosméticos LTDA',
    lastRestock: '2024-03-10',
  },
  {
    id: '3',
    name: 'Óleo Corporal',
    category: 'Corpo',
    quantity: 12,
    minQuantity: 4,
    unit: 'unidade',
    price: 55.00,
    supplier: 'Cosméticos Premium SA',
    lastRestock: '2024-03-12',
  },
]

// GET /api/inventory
export async function GET() {
  return NextResponse.json(products)
}

// POST /api/inventory
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'category', 'quantity', 'minQuantity', 'unit', 'price', 'supplier']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Campo ${field} é obrigatório` },
          { status: 400 }
        )
      }
    }

    // Criar novo produto
    const newProduct = {
      id: Date.now().toString(),
      ...data,
      lastRestock: new Date().toISOString().split('T')[0],
    }

    products.push(newProduct)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const productIndex = products.findIndex(p => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar produto
    products[productIndex] = {
      ...products[productIndex],
      ...data,
    }

    return NextResponse.json(products[productIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productIndex = products.findIndex(p => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Remover produto
    products = products.filter(p => p.id !== params.id)
    return NextResponse.json({ message: 'Produto removido com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao remover produto' },
      { status: 500 }
    )
  }
} 