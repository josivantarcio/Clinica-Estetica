import axios from 'axios';
import { Clinica } from '../models/Clinica';

export class AsaasService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY!;
    this.baseUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
  }

  async criarCliente(clinica: Clinica) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customers`,
        {
          name: clinica.nome,
          cpfCnpj: clinica.documento,
          notificationDisabled: false
        },
        {
          headers: { access_token: this.apiKey }
        }
      );
      
      return response.data.id;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw new Error('Falha ao criar cliente no Asaas');
    }
  }

  async criarAssinatura(clinica: Clinica) {
    try {
      const valor = clinica.plano === 'basico' ? 99 : 199;
      
      const response = await axios.post(
        `${this.baseUrl}/subscriptions`,
        {
          customer: clinica.asaasCustomerId,
          billingType: 'CREDIT_CARD',
          value: valor,
          nextDueDate: new Date(clinica.dataVencimento).toISOString().split('T')[0],
          cycle: 'MONTHLY'
        },
        {
          headers: { access_token: this.apiKey }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura no Asaas:', error);
      throw new Error('Falha ao criar assinatura no Asaas');
    }
  }

  async verificarPagamento(clinicaId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments?customer=${clinicaId}&status=PENDING`,
        {
          headers: { access_token: this.apiKey }
        }
      );
      
      return response.data.data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar pagamento no Asaas:', error);
      throw new Error('Falha ao verificar pagamento no Asaas');
    }
  }

  async processarWebhook(payload: any) {
    try {
      const { event, payment } = payload;
      
      if (event === 'PAYMENT_RECEIVED') {
        // Atualizar status da clínica
        const clinica = await Clinica.findOne({
          where: { asaasCustomerId: payment.customer }
        });

        if (clinica) {
          await clinica.update({
            status: 'active',
            dataVencimento: new Date(payment.dueDate)
          });
        }
      } else if (event === 'PAYMENT_OVERDUE') {
        // Suspender clínica
        const clinica = await Clinica.findOne({
          where: { asaasCustomerId: payment.customer }
        });

        if (clinica) {
          await clinica.update({ status: 'suspended' });
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhook do Asaas:', error);
      throw new Error('Falha ao processar webhook do Asaas');
    }
  }
} 