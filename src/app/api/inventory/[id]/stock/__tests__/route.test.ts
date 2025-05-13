import { NextRequest } from 'next/server'
import { PUT } from '../route'

// Mock dos dados
const mockProducts = [
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
]

describe('Stock Update API', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks()
  })

  describe('PUT', () => {
    it('deve atualizar a quantidade de um produto', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/1/stock', {
        method: 'PUT',
        body: JSON.stringify({ quantity: 20 }),
      })

      const response = await PUT(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.quantity).toBe(20)
      expect(data).toHaveProperty('lastRestock')
    })

    it('deve retornar erro se a quantidade for negativa', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/1/stock', {
        method: 'PUT',
        body: JSON.stringify({ quantity: -1 }),
      })

      const response = await PUT(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('deve retornar erro se o produto não existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/999/stock', {
        method: 'PUT',
        body: JSON.stringify({ quantity: 20 }),
      })

      const response = await PUT(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })
}) 