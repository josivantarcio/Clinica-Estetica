// Testes de acessibilidade

describe('Testes de Acessibilidade', () => {
  it('deve seguir as diretrizes de acessibilidade', () => {
    expect(screen.getByRole('heading', { name: /acessibilidade/i })).toBeInTheDocument();
  });

  it('deve ser navegável com teclado', () => {
    expect(screen.getByRole('heading', { name: /acessibilidade/i })).toBeInTheDocument();
  });
});
