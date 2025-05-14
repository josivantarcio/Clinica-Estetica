import request from 'supertest';
import app from '../app'; // Ajuste o caminho conforme necessário

describe('Testes das Rotas REST', () => {
  // Teste para listar todos os clientes
  it('deve listar todos os clientes', async () => {
    const response = await request(app).get('/api/clientes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Teste para buscar cliente por ID
  it('deve buscar cliente por ID', async () => {
    const response = await request(app).get('/api/clientes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  // Teste para criar novo cliente
  it('deve criar novo cliente', async () => {
    const novoCliente = { nome: 'Teste', email: 'teste@teste.com' };
    const response = await request(app).post('/api/clientes').send(novoCliente);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('nome', 'Teste');
  });

  // Teste para atualizar cliente
  it('deve atualizar cliente', async () => {
    const atualizacao = { nome: 'Teste Atualizado' };
    const response = await request(app).put('/api/clientes/1').send(atualizacao);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nome', 'Teste Atualizado');
  });

  // Teste para deletar cliente
  it('deve deletar cliente', async () => {
    const response = await request(app).delete('/api/clientes/1');
    expect(response.status).toBe(204);
  });

  // Testes similares para outras rotas (Serviços, Funcionários, Agendamentos, etc.)
}); 