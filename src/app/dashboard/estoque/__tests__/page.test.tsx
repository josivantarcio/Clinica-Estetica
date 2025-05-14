/// <reference types="jest" />
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import EstoquePage from '../page'

// Mock dos dados
const mockProducts = [
  {
    id: '1',
    nome: 'Shampoo',
    descricao: 'Shampoo para todos os tipos de cabelo',
    quantidade: 10,
    precoUnitario: 25.00,
    categoria: 'Cabelo',
    fornecedor: 'Fornecedor A',
    minimo: 5,
  },
  {
    id: '2',
    nome: 'Esmalte',
    descricao: 'Esmalte profissional',
    quantidade: 20,
    precoUnitario: 15.00,
    categoria: 'Unhas',
    fornecedor: 'Fornecedor B',
    minimo: 8,
  },
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
    // Mock para GET /api/inventory
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }))

    renderWithChakra(<EstoquePage />)
    
    // Verifica título e botão de novo produto
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo produto/i })).toBeInTheDocument()

    // Aguarda carregamento dos produtos
    await waitFor(() => {
      expect(screen.getByText('Shampoo')).toBeInTheDocument()
      expect(screen.getByText('Esmalte')).toBeInTheDocument()
    })
  })

  it('deve abrir o modal ao clicar no botão Novo Produto', async () => {
    // Mock para GET /api/inventory
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }))

    renderWithChakra(<EstoquePage />)
    
    // Clica no botão Novo Produto
    const newProductButton = screen.getByRole('button', { name: /novo produto/i })
    await userEvent.click(newProductButton)

    // Verifica se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Novo Produto')).toBeInTheDocument()
    })
  })

  it('deve criar um novo produto corretamente', async () => {
    // Mock para GET /api/inventory
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }))

    // Mock para POST /api/inventory
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/inventory' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '3',
            nome: 'Novo Produto',
            descricao: 'Descrição do novo produto',
            quantidade: 15,
            precoUnitario: 30.00,
            categoria: 'Outros',
            fornecedor: 'Fornecedor C',
            minimo: 5,
          }),
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    renderWithChakra(<EstoquePage />)
    
    // Abre modal e preenche formulário
    const newProductButton = screen.getByRole('button', { name: /novo produto/i })
    await userEvent.click(newProductButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Preenche campos do formulário
    await userEvent.type(screen.getByLabelText(/nome/i), 'Novo Produto')
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição do novo produto')
    await userEvent.type(screen.getByLabelText(/quantidade/i), '15')
    await userEvent.type(screen.getByLabelText(/preço unitário/i), '30.00')
    await userEvent.selectOptions(screen.getByLabelText(/categoria/i), 'Outros')
    await userEvent.type(screen.getByLabelText(/fornecedor/i), 'Fornecedor C')
    await userEvent.type(screen.getByLabelText(/mínimo/i), '5')

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await userEvent.click(submitButton)

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    })
  })

  it('deve filtrar produtos por categoria', async () => {
    // Mock para GET /api/inventory
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }))

    renderWithChakra(<EstoquePage />)
    
    // Aguarda carregamento dos produtos
    await waitFor(() => {
      expect(screen.getByText('Shampoo')).toBeInTheDocument()
    })

    // Filtra por categoria
    const categorySelect = screen.getByLabelText(/filtrar por categoria/i)
    await userEvent.selectOptions(categorySelect, 'Cabelo')

    // Verifica se apenas os produtos da categoria são exibidos
    expect(screen.getByText('Shampoo')).toBeInTheDocument()
    expect(screen.queryByText('Esmalte')).not.toBeInTheDocument()
  })

  it('deve atualizar a quantidade do produto', async () => {
    // Mock para GET /api/inventory
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockProducts),
    }))

    // Mock para PUT /api/inventory/:id
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/inventory/1' && options.method === 'PUT') {
        return Promise.resolve({
          ...mockProducts[0],
          quantidade: 15,
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    renderWithChakra(<EstoquePage />)
    
    // Aguarda carregamento dos produtos
    await waitFor(() => {
      expect(screen.getByText('Shampoo')).toBeInTheDocument()
    })

    // Clica no botão de atualizar quantidade
    const updateButton = screen.getByRole('button', { name: /atualizar quantidade/i })
    await userEvent.click(updateButton)

    // Preenche nova quantidade
    const quantityInput = screen.getByLabelText(/nova quantidade/i)
    await userEvent.type(quantityInput, '15')

    // Confirma atualização
    const confirmButton = screen.getByRole('button', { name: /confirmar/i })
    await userEvent.click(confirmButton)

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/inventory/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    })
  })
}) 