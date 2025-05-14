import twilio from 'twilio';
import config from '../config/external-services';
import { logger } from '../utils/logger';

class WhatsAppService {
  private client: twilio.Twilio | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = config.twilio.enabled;
    if (this.enabled) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    }
  }

  async enviarMensagem(numero: string, mensagem: string) {
    if (!this.enabled || !this.client) {
      logger.warn('Serviço de WhatsApp desabilitado');
      return null;
    }

    try {
      // Formatar número para o padrão internacional
      const numeroFormatado = this.formatarNumero(numero);
      
      const message = await this.client.messages.create({
        body: mensagem,
        from: `whatsapp:${config.twilio.whatsappNumber}`,
        to: `whatsapp:${numeroFormatado}`,
      });

      logger.info(`Mensagem enviada com sucesso: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error('Erro ao enviar mensagem WhatsApp:', error);
      throw new Error('Falha ao enviar mensagem WhatsApp');
    }
  }

  private formatarNumero(numero: string): string {
    // Remove caracteres não numéricos
    const numeros = numero.replace(/\D/g, '');
    
    // Adiciona código do país se não existir
    if (!numeros.startsWith('55')) {
      return `+55${numeros}`;
    }
    
    return `+${numeros}`;
  }
}

export const whatsappService = new WhatsAppService(); 