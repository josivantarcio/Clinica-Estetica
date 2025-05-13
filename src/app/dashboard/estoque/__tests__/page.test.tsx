/// <reference types="jest" />
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import EstoquePage from '../page'

// Mock dos dados
const mockProducts = [
  {
    id: 1,
    name: 'Shampoo Profissional',
    category: 'Cabelo',
    quantity: 10,
    minQuantity: 5,
    unit: 'un',
    price: 29.90,
    supplier: 'Fornecedor A',
    lastRestock: '2024-03-15'
  }
]

const mockCategories = [
  { id: '1', name: 'Cabelo' },
  { id: '2', name: 'Pele' },
  { id: '3', name: 'Unhas' }
]

// Mock do fetch
(global as any).fetch = jest.fn()

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>)
}

describe('EstoquePage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks()
  })

  it('deve carregar e exibir a lista de produtos', async () => {
    // Mock para GET /api/inventory e GET /api/inventory/categories
    (global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      }))

    renderWithChakra(<EstoquePage />)
    expect(screen.getByText('Controle de Estoque')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Shampoo Profissional' })).toBeInTheDocument()
    }, { timeout: 10000 })
  }, 10000)

  it('deve abrir o modal ao clicar no botão Novo Produto', async () => {
    // Mock para GET /api/inventory e GET /api/inventory/categories
    (global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      }))

    renderWithChakra(<EstoquePage />)
    const newProductButton = screen.getByRole('button', { name: /novo produto/i })
    await userEvent.click(newProductButton)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: 10000 })
  }, 10000)

  it('deve criar um novo produto corretamente', async () => {
    // Mock para GET /api/inventory e GET /api/inventory/categories
    (global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      }))
    // Mock para POST /api/inventory
    ;(global as any)
      .fetch
      .mockImplementationOnce((url: string, options: any) => {
        if (url === '/api/inventory' && options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              id: 2,
              name: 'Novo Produto',
              category: 'Cabelo',
              quantity: 15,
              minQuantity: 5,
              unit: 'un',
              price: 39.90,
              supplier: 'Fornecedor B',
              lastRestock: new Date().toISOString()
            })
          })
        }
        return Promise.reject(new Error('Not found'))
      })

    renderWithChakra(<EstoquePage />)
    const newProductButton = screen.getByRole('button', { name: /novo produto/i })
    await userEvent.click(newProductButton)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    }, { timeout: 10000 })

    const nameInput = screen.getByRole('textbox', { name: /nome do produto/i })
    const categorySelect = screen.getByRole('combobox', { name: /categoria/i })
    const quantityInputs = screen.getAllByRole('spinbutton', { name: /quantidade/i })
    const quantityInput = quantityInputs[quantityInputs.length - 1]
    const minQuantityInput = screen.getByRole('spinbutton', { name: /quantidade mínima/i })
    const unitInput = screen.getByRole('textbox', { name: /unidade/i })
    const priceInput = screen.getByRole('spinbutton', { name: /preço/i })
    const supplierInput = screen.getByRole('textbox', { name: /fornecedor/i })

    await userEvent.type(nameInput, 'Novo Produto')
    await userEvent.selectOptions(categorySelect, 'Cabelo')
    await userEvent.type(quantityInput, '15')
    await userEvent.type(minQuantityInput, '5')
    await userEvent.type(unitInput, 'un')
    await userEvent.type(priceInput, '39.90')
    await userEvent.type(supplierInput, 'Fornecedor B')

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await userEvent.click(submitButton)
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    }, { timeout: 10000 })
  }, 10000)

  it('deve atualizar a quantidade de um produto', async () => {
    (global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      }))
    // Mock para PUT /api/inventory/1/stock
    ;(global as any)
      .fetch
      .mockImplementationOnce((url: string, options: any) => {
        if (url === '/api/inventory/1/stock' && options.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockProducts[0],
              quantity: 20
            })
          })
        }
        return Promise.reject(new Error('Not found'))
      })

    renderWithChakra(<EstoquePage />)
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Shampoo Profissional' })).toBeInTheDocument()
    }, { timeout: 10000 })
    const quantityInputs = screen.getAllByRole('spinbutton', { name: /quantidade/i })
    const quantityInput = quantityInputs[0]
    await userEvent.clear(quantityInput)
    await userEvent.type(quantityInput, '20')
    fireEvent.blur(quantityInput)
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/inventory/1/stock', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    }, { timeout: 10000 })
  }, 10000)

  it('deve excluir um produto', async () => {
    (global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      }))
    // Mock para DELETE /api/inventory/1
    ;(global as any)
      .fetch
      .mockImplementationOnce((url: string, options: any) => {
        if (url === '/api/inventory/1' && options.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({})
          })
        }
        return Promise.reject(new Error('Not found'))
      })
    // Mock para GET /api/inventory após exclusão (retorna lista vazia, mas com campos esperados)
    ;(global as any)
      .fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      }))
    renderWithChakra(<EstoquePage />)
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Shampoo Profissional' })).toBeInTheDocument()
    }, { timeout: 10000 })
    const deleteButton = screen.getByRole('button', { name: /excluir produto/i })
    await userEvent.click(deleteButton)
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/inventory/1', {
        method: 'DELETE',
      })
    }, { timeout: 10000 })
  }, 10000)
}) 