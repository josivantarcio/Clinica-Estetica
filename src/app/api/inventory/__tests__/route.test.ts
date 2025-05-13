import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

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

describe('Inventory API', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('deve retornar a lista de produtos', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('name')
    })
  })

  describe('POST', () => {
    it('deve criar um novo produto', async () => {
      const newProduct = {
        name: 'Novo Produto',
        category: 'Cabelo',
        quantity: 10,
        minQuantity: 5,
        unit: 'unidade',
        price: 50.00,
        supplier: 'Fornecedor Teste',
      }

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newProduct),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(newProduct.name)
      expect(data.category).toBe(newProduct.category)
      expect(data.quantity).toBe(newProduct.quantity)
    })

    it('deve retornar erro se faltar campos obrigatórios', async () => {
      const invalidProduct = {
        name: 'Produto Inválido',
        // Faltando campos obrigatórios
      }

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(invalidProduct),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('PUT', () => {
    it('deve atualizar um produto existente', async () => {
      const updatedProduct = {
        name: 'Produto Atualizado',
        category: 'Cabelo',
        quantity: 20,
        minQuantity: 5,
        unit: 'unidade',
        price: 55.00,
        supplier: 'Fornecedor Atualizado',
      }

      const request = new NextRequest('http://localhost:3000/api/inventory/1', {
        method: 'PUT',
        body: JSON.stringify(updatedProduct),
      })

      const response = await PUT(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe(updatedProduct.name)
      expect(data.quantity).toBe(updatedProduct.quantity)
    })

    it('deve retornar erro se o produto não existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/999', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Produto Inexistente' }),
      })

      const response = await PUT(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })

  describe('DELETE', () => {
    it('deve excluir um produto existente', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
    })

    it('deve retornar erro se o produto não existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/999', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })
}) 