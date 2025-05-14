import { z } from 'zod';

// Schema de validação para configurações do Twilio
const twilioConfigSchema = z.object({
  accountSid: z.string().min(1, 'Account SID é obrigatório'),
  authToken: z.string().min(1, 'Auth Token é obrigatório'),
  whatsappNumber: z.string().min(1, 'Número do WhatsApp é obrigatório'),
  enabled: z.boolean().default(true),
});

// Schema de validação para configurações gerais de serviços externos
const externalServicesConfigSchema = z.object({
  twilio: twilioConfigSchema,
  environment: z.enum(['development', 'production']).default('development'),
});

// Validação das variáveis de ambiente
const config = externalServicesConfigSchema.parse({
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    enabled: process.env.TWILIO_ENABLED !== 'false',
  },
  environment: process.env.NODE_ENV || 'development',
});

export default config; 