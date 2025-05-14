import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ConfiguracoesPage from '../page';

// Mock dos dados
const mockSettings = {
  empresa: {
    nome: 'Salão de Beleza',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua Principal, 123',
    telefone: '(11) 99999-9999',
    email: 'contato@salao.com',
    horarioAbertura: '09:00',
    horarioFechamento: '18:00',
  },
  whatsapp: {
    accountSid: 'AC123456789',
    authToken: 'abc123',
    whatsappNumber: '+5511999999999',
    enabled: true,
  },
  notificacoes: {
    lembreteAgendamento: true,
    confirmacaoAgendamento: true,
    cancelamentoAgendamento: true,
    tempoLembrete: 24, // horas
  },
};

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ConfiguracoesPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir as configurações', async () => {
    // Mock para GET /api/settings
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    }));

    renderWithChakra(<ConfiguracoesPage />);
    
    // Verifica título e seções
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Dados da Empresa')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();

    // Aguarda carregamento das configurações
    await waitFor(() => {
      expect(screen.getByDisplayValue('Salão de Beleza')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12.345.678/0001-90')).toBeInTheDocument();
    });
  });

  it('deve atualizar dados da empresa', async () => {
    // Mock para GET /api/settings
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    }));

    // Mock para PUT /api/settings/empresa
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/settings/empresa' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockSettings.empresa,
            nome: 'Novo Nome do Salão',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ConfiguracoesPage />);
    
    // Aguarda carregamento das configurações
    await waitFor(() => {
      expect(screen.getByDisplayValue('Salão de Beleza')).toBeInTheDocument();
    });

    // Atualiza nome da empresa
    const nomeInput = screen.getByLabelText(/nome da empresa/i);
    await userEvent.clear(nomeInput);
    await userEvent.type(nomeInput, 'Novo Nome do Salão');

    // Salva alterações
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/settings/empresa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve atualizar configurações do WhatsApp', async () => {
    // Mock para GET /api/settings
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    }));

    // Mock para PUT /api/settings/whatsapp
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/settings/whatsapp' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockSettings.whatsapp,
            whatsappNumber: '+5511988888888',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ConfiguracoesPage />);
    
    // Aguarda carregamento das configurações
    await waitFor(() => {
      expect(screen.getByDisplayValue('+5511999999999')).toBeInTheDocument();
    });

    // Atualiza número do WhatsApp
    const whatsappInput = screen.getByLabelText(/número do whatsapp/i);
    await userEvent.clear(whatsappInput);
    await userEvent.type(whatsappInput, '+5511988888888');

    // Salva alterações
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/settings/whatsapp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve atualizar configurações de notificações', async () => {
    // Mock para GET /api/settings
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    }));

    // Mock para PUT /api/settings/notificacoes
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/settings/notificacoes' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockSettings.notificacoes,
            tempoLembrete: 48,
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<ConfiguracoesPage />);
    
    // Aguarda carregamento das configurações
    await waitFor(() => {
      expect(screen.getByLabelText(/tempo de lembrete/i)).toBeInTheDocument();
    });

    // Atualiza tempo de lembrete
    const tempoInput = screen.getByLabelText(/tempo de lembrete/i);
    await userEvent.clear(tempoInput);
    await userEvent.type(tempoInput, '48');

    // Salva alterações
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/settings/notificacoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve validar campos obrigatórios', async () => {
    // Mock para GET /api/settings
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    }));

    renderWithChakra(<ConfiguracoesPage />);
    
    // Aguarda carregamento das configurações
    await waitFor(() => {
      expect(screen.getByDisplayValue('Salão de Beleza')).toBeInTheDocument();
    });

    // Limpa campo obrigatório
    const nomeInput = screen.getByLabelText(/nome da empresa/i);
    await userEvent.clear(nomeInput);

    // Tenta salvar
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica mensagem de erro
    expect(screen.getByText(/nome da empresa é obrigatório/i)).toBeInTheDocument();
  });
}); 