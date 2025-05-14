import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import RelatoriosPage from '../page';

// Mock dos dados
const mockReports = {
  vendas: {
    total: 5000.00,
    porServico: [
      { servico: 'Corte de Cabelo', quantidade: 20, valor: 1000.00 },
      { servico: 'Manicure', quantidade: 30, valor: 1050.00 },
    ],
    porDia: [
      { data: '2024-03-20', valor: 1500.00 },
      { data: '2024-03-21', valor: 2000.00 },
    ],
  },
  clientes: {
    total: 50,
    novos: 10,
    ativos: 40,
    porNivel: [
      { nivel: 'Bronze', quantidade: 20 },
      { nivel: 'Prata', quantidade: 15 },
      { nivel: 'Ouro', quantidade: 10 },
      { nivel: 'Diamante', quantidade: 5 },
    ],
  },
  servicos: {
    total: 20,
    maisPopulares: [
      { servico: 'Corte de Cabelo', quantidade: 20 },
      { servico: 'Manicure', quantidade: 30 },
    ],
    porCategoria: [
      { categoria: 'Cabelo', quantidade: 10 },
      { categoria: 'Unhas', quantidade: 8 },
    ],
  },
};

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('RelatoriosPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir os relatórios', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Verifica título e filtros
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByLabelText(/data inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data final/i)).toBeInTheDocument();

    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Vendas')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('Serviços')).toBeInTheDocument();
    });
  });

  it('deve filtrar relatórios por período', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Vendas')).toBeInTheDocument();
    });

    // Preenche filtros de data
    const startDateInput = screen.getByLabelText(/data inicial/i);
    const endDateInput = screen.getByLabelText(/data final/i);

    await userEvent.type(startDateInput, '2024-03-01');
    await userEvent.type(endDateInput, '2024-03-31');

    // Clica no botão de filtrar
    const filterButton = screen.getByRole('button', { name: /filtrar/i });
    await userEvent.click(filterButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/reports?startDate=2024-03-01&endDate=2024-03-31');
    });
  });

  it('deve exibir detalhes das vendas', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Vendas')).toBeInTheDocument();
    });

    // Verifica detalhes das vendas
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    expect(screen.getByText('Manicure')).toBeInTheDocument();
  });

  it('deve exibir detalhes dos clientes', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Clientes')).toBeInTheDocument();
    });

    // Verifica detalhes dos clientes
    expect(screen.getByText('50')).toBeInTheDocument(); // Total de clientes
    expect(screen.getByText('10')).toBeInTheDocument(); // Novos clientes
    expect(screen.getByText('40')).toBeInTheDocument(); // Clientes ativos
    expect(screen.getByText('Bronze')).toBeInTheDocument();
    expect(screen.getByText('Prata')).toBeInTheDocument();
    expect(screen.getByText('Ouro')).toBeInTheDocument();
    expect(screen.getByText('Diamante')).toBeInTheDocument();
  });

  it('deve exibir detalhes dos serviços', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Serviços')).toBeInTheDocument();
    });

    // Verifica detalhes dos serviços
    expect(screen.getByText('20')).toBeInTheDocument(); // Total de serviços
    expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
    expect(screen.getByText('Manicure')).toBeInTheDocument();
    expect(screen.getByText('Cabelo')).toBeInTheDocument();
    expect(screen.getByText('Unhas')).toBeInTheDocument();
  });

  it('deve exportar relatório em PDF', async () => {
    // Mock para GET /api/reports
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockReports),
    }));

    // Mock para POST /api/reports/export
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      blob: () => Promise.resolve(new Blob(['PDF content'], { type: 'application/pdf' })),
    }));

    renderWithChakra(<RelatoriosPage />);
    
    // Aguarda carregamento dos relatórios
    await waitFor(() => {
      expect(screen.getByText('Vendas')).toBeInTheDocument();
    });

    // Clica no botão de exportar
    const exportButton = screen.getByRole('button', { name: /exportar/i });
    await userEvent.click(exportButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });
}); 