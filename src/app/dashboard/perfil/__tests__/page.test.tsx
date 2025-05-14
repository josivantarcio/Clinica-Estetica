import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import PerfilPage from '../page';

// Mock dos dados
const mockUser = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '(11) 99999-9999',
  cargo: 'Gerente',
  foto: 'https://example.com/foto.jpg',
  ultimoAcesso: '2024-03-20T10:00:00',
};

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('PerfilPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve carregar e exibir os dados do perfil', async () => {
    // Mock para GET /api/profile
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    }));

    renderWithChakra(<PerfilPage />);
    
    // Verifica título
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();

    // Aguarda carregamento dos dados
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
      expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Gerente')).toBeInTheDocument();
    });
  });

  it('deve atualizar dados do perfil', async () => {
    // Mock para GET /api/profile
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    }));

    // Mock para PUT /api/profile
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/profile' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ...mockUser,
            nome: 'João Silva Santos',
            telefone: '(11) 98888-8888',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<PerfilPage />);
    
    // Aguarda carregamento dos dados
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    // Atualiza dados
    const nomeInput = screen.getByLabelText(/nome/i);
    const telefoneInput = screen.getByLabelText(/telefone/i);

    await userEvent.clear(nomeInput);
    await userEvent.type(nomeInput, 'João Silva Santos');

    await userEvent.clear(telefoneInput);
    await userEvent.type(telefoneInput, '(11) 98888-8888');

    // Salva alterações
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve atualizar senha', async () => {
    // Mock para GET /api/profile
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    }));

    // Mock para PUT /api/profile/password
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/profile/password' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Senha atualizada com sucesso' }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<PerfilPage />);
    
    // Aguarda carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Alterar Senha')).toBeInTheDocument();
    });

    // Clica no botão de alterar senha
    const changePasswordButton = screen.getByRole('button', { name: /alterar senha/i });
    await userEvent.click(changePasswordButton);

    // Preenche formulário de senha
    const currentPasswordInput = screen.getByLabelText(/senha atual/i);
    const newPasswordInput = screen.getByLabelText(/nova senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i);

    await userEvent.type(currentPasswordInput, 'senha123');
    await userEvent.type(newPasswordInput, 'novaSenha123');
    await userEvent.type(confirmPasswordInput, 'novaSenha123');

    // Salva alterações
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('deve validar senhas iguais', async () => {
    // Mock para GET /api/profile
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    }));

    renderWithChakra(<PerfilPage />);
    
    // Aguarda carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Alterar Senha')).toBeInTheDocument();
    });

    // Clica no botão de alterar senha
    const changePasswordButton = screen.getByRole('button', { name: /alterar senha/i });
    await userEvent.click(changePasswordButton);

    // Preenche formulário de senha com senhas diferentes
    const currentPasswordInput = screen.getByLabelText(/senha atual/i);
    const newPasswordInput = screen.getByLabelText(/nova senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar nova senha/i);

    await userEvent.type(currentPasswordInput, 'senha123');
    await userEvent.type(newPasswordInput, 'novaSenha123');
    await userEvent.type(confirmPasswordInput, 'senhaDiferente');

    // Tenta salvar
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica mensagem de erro
    expect(screen.getByText(/as senhas não conferem/i)).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    // Mock para GET /api/profile
    (global as any).fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockUser),
    }));

    renderWithChakra(<PerfilPage />);
    
    // Aguarda carregamento dos dados
    await waitFor(() => {
      expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    });

    // Limpa campo obrigatório
    const nomeInput = screen.getByLabelText(/nome/i);
    await userEvent.clear(nomeInput);

    // Tenta salvar
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica mensagem de erro
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
  });
}); 