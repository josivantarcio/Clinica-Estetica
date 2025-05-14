import { enviarMensagemWhatsApp } from '../services/whatsapp';

describe('Testes da Integração com WhatsApp', () => {
  it('deve enviar mensagem com sucesso', async () => {
    const numero = '+5511999999999'; // Substitua pelo número de teste
    const mensagem = 'Teste de integração com WhatsApp';
    const response = await enviarMensagemWhatsApp(numero, mensagem);
    expect(response).toBeDefined();
    expect(response.sid).toBeDefined();
  });

  it('deve lançar erro ao enviar mensagem para número inválido', async () => {
    const numero = 'numero_invalido';
    const mensagem = 'Teste de erro';
    await expect(enviarMensagemWhatsApp(numero, mensagem)).rejects.toThrow();
  });
}); 