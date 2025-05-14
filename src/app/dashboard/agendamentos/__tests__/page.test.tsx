import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import AgendamentosPage from '../page';

// Mock dos dados
const mockAppointments = [
  {
    id: '1',
    cliente: {
      id: '1',
      nome: 'Maria Silva',
      telefone: '(11) 99999-9999',
    },
    servico: {
      id: '1',
      nome: 'Corte de Cabelo',
      duracao: 60,
      preco: 50.00,
    },
    data: '2024-03-20T14:00:00',
    status: 'confirmado',
    observacoes: 'Preferência por cabelereiro específico',
  },
  {
    id: '2',
    cliente: {
      id: '2',
      nome: 'João Santos',
      telefone: '(11) 98888-8888',
    },
    servico: {
      id: '2',
      nome: 'Manicure',
      duracao: 45,
      preco: 35.00,
    },
    data: '2024-03-20T15:30:00',
    status: 'pendente',
    observacoes: '',
  },
];

// Mock do fetch
(global as any).fetch = jest.fn().mockImplementation((url: string) => {
  if (url.includes('/api/reports')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        totalRevenue: 10000,
        totalAppointments: 200,
        revenueGrowth: 10,
        appointmentsGrowth: 5,
        revenueByService: [
          { service: 'Corte de Cabelo', revenue: 5000 },
          { service: 'Manicure', revenue: 3000 },
        ],
        appointmentsByStatus: [
          { status: 'confirmado', count: 150 },
          { status: 'pendente', count: 50 },
        ],
        revenueByMonth: [
          { month: 'Janeiro', revenue: 2000 },
          { month: 'Fevereiro', revenue: 3000 },
        ],
      }),
    });
  }
  return Promise.reject(new Error('Not found'));
});

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('AgendamentosPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir a lista de agendamentos', async () => {
    // Mock para GET /api/appointments
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    }));

    renderWithChakra(<AgendamentosPage />);
    
    // Verifica título e botão de novo agendamento
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo agendamento/i })).toBeInTheDocument();

    // Aguarda carregamento dos agendamentos
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal ao clicar no botão Novo Agendamento', async () => {
    // Mock para GET /api/appointments
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    }));

    renderWithChakra(<AgendamentosPage />);
    
    // Clica no botão Novo Agendamento
    const newAppointmentButton = screen.getByRole('button', { name: /novo agendamento/i });
    await userEvent.click(newAppointmentButton);

    // Verifica se o modal foi aberto
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Novo Agendamento')).toBeInTheDocument();
    });
  });

  it('deve criar um novo agendamento corretamente', async () => {
    // Mock para GET /api/appointments
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    }));

    // Mock para POST /api/appointments
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/appointments' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '3',
            cliente: {
              id: '3',
              nome: 'Novo Cliente',
              telefone: '(11) 97777-7777',
            },
            servico: {
              id: '1',
              nome: 'Corte de Cabelo',
              duracao: 60,
              preco: 50.00,
            },
            data: '2024-03-21T10:00:00',
            status: 'pendente',
            observacoes: '',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<AgendamentosPage />);
    
    // Abre modal e preenche formulário
    const newAppointmentButton = screen.getByRole('button', { name: /novo agendamento/i });
    await userEvent.click(newAppointmentButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Preenche campos do formulário
    await userEvent.selectOptions(screen.getByLabelText(/cliente/i), '3');
    await userEvent.selectOptions(screen.getByLabelText(/serviço/i), '1');
    await userEvent.type(screen.getByLabelText(/data/i), '2024-03-21');
    await userEvent.type(screen.getByLabelText(/hora/i), '10:00');

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(submitButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve filtrar agendamentos por data', async () => {
    // Mock para GET /api/appointments
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    }));

    renderWithChakra(<AgendamentosPage />);
    
    // Aguarda carregamento dos agendamentos
    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    // Filtra por data
    const dateInput = screen.getByLabelText(/filtrar por data/i);
    await userEvent.type(dateInput, '2024-03-20');

    // Verifica se os agendamentos do dia são exibidos
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('João Santos')).toBeInTheDocument();
  });

  it('deve atualizar o status do agendamento', async () => {
    // Mock para GET /api/appointments
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    }));

    // Mock para PUT /api/appointments/:id
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/appointments/2' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockAppointments[1],
            status: 'confirmado',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<AgendamentosPage />);
    
    // Aguarda carregamento dos agendamentos
    await waitFor(() => {
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });

    // Clica no botão de status
    const statusButton = screen.getByRole('button', { name: /pendente/i });
    await userEvent.click(statusButton);

    // Seleciona novo status
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    await userEvent.click(confirmButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/appointments/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });
}); 