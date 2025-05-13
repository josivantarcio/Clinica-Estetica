import { NextResponse } from 'next/server'

// Simulando um banco de dados (mesmo array da API principal)
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

// PUT /api/inventory/[id]/stock
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { quantity } = data

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantidade inválida' },
        { status: 400 }
      )
    }

    const productIndex = products.findIndex(p => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar quantidade e data da última reposição
    products[productIndex] = {
      ...products[productIndex],
      quantity,
      lastRestock: new Date().toISOString().split('T')[0],
    }

    return NextResponse.json(products[productIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque' },
      { status: 500 }
    )
  }
} 