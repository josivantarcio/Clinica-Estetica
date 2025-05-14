import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import LoginPage from '../page';

// Mock do fetch
(global as any).fetch = jest.fn();

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve renderizar a página de login corretamente', () => {
    renderWithChakra(<LoginPage />);
    
    // Verifica elementos da página
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });

  it('deve fazer login com sucesso', async () => {
    // Mock para POST /api/auth/login
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/auth/login' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'fake-jwt-token',
            user: {
              id: '1',
              nome: 'João Silva',
              email: 'joao@example.com',
              cargo: 'Gerente',
            },
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<LoginPage />);
    
    // Preenche formulário
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await userEvent.type(emailInput, 'joao@example.com');
    await userEvent.type(passwordInput, 'senha123');

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'joao@example.com',
          password: 'senha123',
        }),
      });
    });
  });

  it('deve exibir erro de credenciais inválidas', async () => {
    // Mock para POST /api/auth/login
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/auth/login' && options.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            message: 'Credenciais inválidas',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<LoginPage />);
    
    // Preenche formulário
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await userEvent.type(emailInput, 'joao@example.com');
    await userEvent.type(passwordInput, 'senhaErrada');

    // Submete formulário
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    // Verifica mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    renderWithChakra(<LoginPage />);
    
    // Tenta submeter formulário vazio
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    // Verifica mensagens de erro
    expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
  });

  it('deve validar formato de email', async () => {
    renderWithChakra(<LoginPage />);
    
    // Preenche email inválido
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'email-invalido');

    // Tenta submeter formulário
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await userEvent.click(submitButton);

    // Verifica mensagem de erro
    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('deve redirecionar para recuperação de senha', async () => {
    renderWithChakra(<LoginPage />);
    
    // Clica no link de esqueceu a senha
    const forgotPasswordLink = screen.getByText(/esqueceu sua senha/i);
    await userEvent.click(forgotPasswordLink);

    // Verifica se o modal de recuperação foi aberto
    expect(screen.getByText('Recuperar Senha')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('deve enviar email de recuperação de senha', async () => {
    // Mock para POST /api/auth/forgot-password
    (global as any).fetch.mockImplementationOnce((url: string, options: any) => {
      if (url === '/api/auth/forgot-password' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: 'Email de recuperação enviado',
          }),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithChakra(<LoginPage />);
    
    // Abre modal de recuperação
    const forgotPasswordLink = screen.getByText(/esqueceu sua senha/i);
    await userEvent.click(forgotPasswordLink);

    // Preenche email
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'joao@example.com');

    // Envia solicitação
    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await userEvent.click(submitButton);

    // Verifica se a requisição foi feita corretamente
    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'joao@example.com',
        }),
      });
    });

    // Verifica mensagem de sucesso
    expect(screen.getByText(/email de recuperação enviado/i)).toBeInTheDocument();
  });
}); 