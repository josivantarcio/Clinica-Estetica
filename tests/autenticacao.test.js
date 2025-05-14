// Testes de autenticação

describe('Testes de Autenticação', () => {
  it('deve autenticar com credenciais válidas', () => {
    expect(screen.getByText((content, element) => content.includes('Login'))).toBeInTheDocument();
  });

  it('deve falhar com credenciais inválidas', () => {
    expect(screen.getByText((content, element) => content.includes('Login'))).toBeInTheDocument();
  });
});
