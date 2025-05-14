import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ClientesPage from '../../page';

// Mock dos dados
const mockClients = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    telefone: '(11) 99999-9999',
    dataNascimento: '1990-01-01',
    pontos: 100,
    nivel: 'Prata',
    totalGasto: 1500.00,
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@example.com',
    telefone: '(11) 98888-8888',
    dataNascimento: '1985-05-15',
    pontos: 50,
    nivel: 'Bronze',
    totalGasto: 500.00,
  },
];

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ClientesPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir a lista de clientes', async () => {
    // Mock para GET /api/clients
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }));

    renderWithChakra(<ClientesPage />);
    
    // Verifica título e botão de novo cliente
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo cliente/i })).toBeInTheDocument();

    // Aguarda carregamento dos clientes
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal ao clicar no botão Novo Cliente', async () => {
    // Mock para GET /api/clients
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }));

    renderWithChakra(<ClientesPage />);
    
    // Clica no botão Novo Cliente
    const newClientButton = screen.getByRole('button', { name: /novo cliente/i });
    await userEvent.click(newClientButton);

    // Verifica se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    });
  });

  it('deve criar um novo cliente corretamente', async () => {
    // Mock para GET /api/clients
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }));

    // Mock para POST /api/clients
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/clients' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '3',
            nome: 'Novo Cliente',
            email: 'novo@example.com',
            telefone: '(11) 97777-7777',
            dataNascimento: '1995-10-20',
            pontos: 0,
            nivel: 'Bronze',
            totalGasto: 0,
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ClientesPage />);
    
    // Abre modal e preenche formulário
    const newClientButton = screen.getByRole('button', { name: /novo cliente/i });
    await userEvent.click(newClientButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Preenche campos do formulário
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/nome/i), 'Novo Cliente');
    });
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/email/i), 'novo@example.com');
    });
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/telefone/i), '(11) 97777-7777');
    });
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/data de nascimento/i), '1995-10-20');
    });

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(submitButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve filtrar clientes por nome', async () => {
    // Mock para GET /api/clients
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }));

    renderWithChakra(<ClientesPage />);
    
    // Aguarda carregamento dos clientes
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    // Filtra por nome
    const searchInput = screen.getByPlaceholderText(/buscar cliente/i);
    await userEvent.type(searchInput, 'Maria');

    // Verifica se apenas Maria Silva está visível
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.queryByText('João Santos')).not.toBeInTheDocument();
  });

  it('deve exibir detalhes do cliente ao clicar em um cliente', async () => {
    // Mock para GET /api/clients
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }));

    renderWithChakra(<ClientesPage />);
    
    // Aguarda carregamento dos clientes
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    // Clica no cliente
    await userEvent.click(screen.getByText('Maria Silva'));

    // Verifica se os detalhes são exibidos
    expect(screen.getByText('Detalhes do Cliente')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('Nível: Prata')).toBeInTheDocument();
    expect(screen.getByText('Pontos: 100')).toBeInTheDocument();
  });
}); 