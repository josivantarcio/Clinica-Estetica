import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

// Mock dos dados
const mockCategories = [
  {
    id: '1',
    name: 'Cabelo',
  },
  {
    id: '2',
    name: 'Corpo',
  },
]

describe('Categories API', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('deve retornar a lista de categorias', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories')
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
    it('deve criar uma nova categoria', async () => {
      const newCategory = {
        name: 'Nova Categoria',
      }

      const request = new NextRequest('http://localhost:3000/api/inventory/categories', {
        method: 'POST',
        body: JSON.stringify(newCategory),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(newCategory.name)
    })

    it('deve retornar erro se o nome não for fornecido', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('deve retornar erro se a categoria já existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Cabelo' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('PUT', () => {
    it('deve atualizar uma categoria existente', async () => {
      const updatedCategory = {
        name: 'Categoria Atualizada',
      }

      const request = new NextRequest('http://localhost:3000/api/inventory/categories/1', {
        method: 'PUT',
        body: JSON.stringify(updatedCategory),
      })

      const response = await PUT(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe(updatedCategory.name)
    })

    it('deve retornar erro se a categoria não existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories/999', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Categoria Inexistente' }),
      })

      const response = await PUT(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })

  describe('DELETE', () => {
    it('deve excluir uma categoria existente', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message')
    })

    it('deve retornar erro se a categoria não existir', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/categories/999', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })
}) 