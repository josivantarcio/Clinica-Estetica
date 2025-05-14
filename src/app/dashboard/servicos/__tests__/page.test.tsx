import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ServicosPage from '../page';

// Mock dos dados
const mockServices = [
  {
    id: '1',
    nome: 'Corte de Cabelo',
    descricao: 'Corte tradicional com tesoura ou máquina',
    duracao: 60,
    preco: 50.00,
    categoria: 'Cabelo',
    ativo: true,
  },
  {
    id: '2',
    nome: 'Manicure',
    descricao: 'Cuidados com as unhas das mãos',
    duracao: 45,
    preco: 35.00,
    categoria: 'Unhas',
    ativo: true,
  },
];

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ServicosPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir a lista de serviços', async () => {
    // Mock para GET /api/services
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockServices),
    }));

    renderWithChakra(<ServicosPage />);
    
    // Verifica título e botão de novo serviço
    expect(screen.getByText('Serviços')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo serviço/i })).toBeInTheDocument();

    // Aguarda carregamento dos serviços
    await waitFor(() => {
      expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
      expect(screen.getByText('Manicure')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal ao clicar no botão Novo Serviço', async () => {
    // Mock para GET /api/services
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockServices),
    }));

    renderWithChakra(<ServicosPage />);
    
    // Clica no botão Novo Serviço
    const newServiceButton = screen.getByRole('button', { name: /novo serviço/i });
    await userEvent.click(newServiceButton);

    // Verifica se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Novo Serviço')).toBeInTheDocument();
    });
  });

  it('deve criar um novo serviço corretamente', async () => {
    // Mock para GET /api/services
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockServices),
    }));

    // Mock para POST /api/services
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/services' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '3',
            nome: 'Novo Serviço',
            descricao: 'Descrição do novo serviço',
            duracao: 30,
            preco: 25.00,
            categoria: 'Outros',
            ativo: true,
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ServicosPage />);
    
    // Abre modal e preenche formulário
    const newServiceButton = screen.getByRole('button', { name: /novo serviço/i });
    await userEvent.click(newServiceButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Preenche campos do formulário
    await userEvent.type(screen.getByLabelText(/nome/i), 'Novo Serviço');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição do novo serviço');
    await userEvent.type(screen.getByLabelText(/duração/i), '30');
    await userEvent.type(screen.getByLabelText(/preço/i), '25.00');
    await userEvent.selectOptions(screen.getByLabelText(/categoria/i), 'Outros');

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(submitButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve filtrar serviços por categoria', async () => {
    // Mock para GET /api/services
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockServices),
    }));

    renderWithChakra(<ServicosPage />);
    
    // Aguarda carregamento dos serviços
    await waitFor(() => {
      expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    });

    // Filtra por categoria
    const categorySelect = screen.getByLabelText(/filtrar por categoria/i);
    await userEvent.selectOptions(categorySelect, 'Cabelo');

    // Verifica se apenas os serviços da categoria são exibidos
    expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    expect(screen.queryByText('Manicure')).not.toBeInTheDocument();
  });

  it('deve atualizar o status do serviço', async () => {
    // Mock para GET /api/services
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockServices),
    }));

    // Mock para PUT /api/services/:id
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/services/1' && options.method === 'PUT') {
        return Promise.resolve({
          ...mockServices[0],
          ativo: false,
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ServicosPage />);
    
    // Aguarda carregamento dos serviços
    await waitFor(() => {
      expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    });

    // Clica no botão de status
    const statusButton = screen.getByRole('button', { name: /ativo/i });
    await userEvent.click(statusButton);

    // Seleciona novo status
    const deactivateButton = screen.getByRole('button', { name: /desativar/i });
    await userEvent.click(deactivateButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/services/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });
}); 