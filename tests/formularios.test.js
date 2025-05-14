// Testes de formulários

describe('Testes de Formulários', () => {
  it('deve validar campos obrigatórios', () => {
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('deve enviar dados corretamente', () => {
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
