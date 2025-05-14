import { render, screen } from '@testing-library/react';
import HomePage from '../components/HomePage';

describe('Testes da Interface do Usuário', () => {
  it('deve renderizar o título principal corretamente', () => {
    render(<HomePage />);
    expect(
      screen.getByText('Sistema de Gestão para Clínicas de Estética')
    ).toBeInTheDocument();
  });

  it('deve exibir a descrição da plataforma', () => {
    render(<HomePage />);
    expect(
      screen.getByText(
        /Gerencie sua clínica de estética com facilidade. Agendamentos, clientes, pagamentos e muito mais em uma única plataforma./i
      )
    ).toBeInTheDocument();
  });

  it('deve exibir o botão "Começar Agora"', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /Começar Agora/i })).toBeInTheDocument();
  });
}); 