import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import DashboardLayout from '../layout';
import { useRouter } from 'next/navigation';

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock do AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      nome: 'Test User',
      email: 'test@example.com',
      clinicaId: '1',
    },
    isAuthenticated: true,
    signOut: jest.fn(),
  }),
}));

// Wrapper para renderizar componentes com ChakraProvider
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('Dashboard', () => {
  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
  });

  it('deve renderizar o layout do dashboard corretamente', () => {
    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Verifica elementos do layout
    expect(screen.getByText('Sistema de Gestão')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('deve exibir o menu lateral com todas as opções', () => {
    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Verifica opções do menu
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Serviços')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('deve navegar para a página correta ao clicar no menu', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Clica em diferentes opções do menu
    await userEvent.click(screen.getByText('Agenda'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/agenda');

    await userEvent.click(screen.getByText('Clientes'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/clientes');

    await userEvent.click(screen.getByText('Serviços'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/servicos');
  });

  it('deve abrir o menu de usuário ao clicar no avatar', async () => {
    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Clica no avatar
    const avatarButton = screen.getByRole('button', { name: /Test User/i });
    await userEvent.click(avatarButton);

    // Verifica opções do menu
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('deve chamar signOut ao clicar em Sair', async () => {
    const mockSignOut = jest.fn();
    jest.spyOn(require('@/contexts/AuthContext'), 'useAuth').mockReturnValue({
      user: {
        id: '1',
        nome: 'Test User',
        email: 'test@example.com',
        clinicaId: '1',
      },
      isAuthenticated: true,
      signOut: mockSignOut,
    });

    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Abre menu e clica em Sair
    const avatarButton = screen.getByRole('button', { name: /Test User/i });
    await userEvent.click(avatarButton);
    await userEvent.click(screen.getByText('Sair'));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('deve exibir notificações ao clicar no ícone de notificação', async () => {
    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Clica no ícone de notificação
    const notificationButton = screen.getByRole('button', { name: /notificações/i });
    await userEvent.click(notificationButton);

    // Verifica se o painel de notificações é exibido
    expect(screen.getByText('Notificações')).toBeInTheDocument();
  });

  it('deve exibir o breadcrumb corretamente', () => {
    renderWithChakra(<DashboardLayout>Test Content</DashboardLayout>);
    
    // Verifica breadcrumb
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });
}); 