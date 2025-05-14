// Testes de responsividade

describe('Testes de Responsividade', () => {
  it('deve ajustar layout para dispositivos móveis', () => {
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('deve ajustar layout para desktop', () => {
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });
});
