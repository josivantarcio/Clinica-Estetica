// Testes de integração

describe('Testes de Integração', () => {
  it('deve integrar corretamente o módulo de autenticação', () => {
    expect(screen.getByText((content, element) => content.includes('Autenticação'))).toBeInTheDocument();
  });

  it('deve integrar corretamente o módulo de agendamentos', () => {
    expect(screen.getByText((content, element) => content.includes('Autenticação'))).toBeInTheDocument();
  });
});
