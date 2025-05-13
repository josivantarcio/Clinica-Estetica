import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import { Clinica } from '../models/Clinica';

interface AuthenticatedRequest extends Request {
  user?: {
    clinicaId: string;
  };
  sequelize?: Sequelize;
}

export const verificaClinicaAtiva = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const clinicaId = req.user?.clinicaId;
    
    if (!clinicaId) {
      return res.status(401).json({
        error: 'Clínica não identificada'
      });
    }

    const clinica = await Clinica.findByPk(clinicaId);
    
    if (!clinica) {
      return res.status(404).json({
        error: 'Clínica não encontrada'
      });
    }

    if (clinica.status !== 'active') {
      return res.status(403).json({
        error: 'Clínica suspensa. Regularize seu pagamento.',
        paymentUrl: clinica.asaasCustomerId ? 
          `https://api.asaas.com/pay/${clinica.asaasCustomerId}` : 
          undefined
      });
    }

    // Configura schema dinâmico para a clínica
    const schemaName = `clinica_${clinicaId.replace(/-/g, '_')}`;
    req.sequelize = new Sequelize(process.env.DATABASE_URL!, {
      schema: schemaName,
      logging: false
    });

    next();
  } catch (error) {
    console.error('Erro ao verificar status da clínica:', error);
    res.status(500).json({
      error: 'Erro interno ao verificar status da clínica'
    });
  }
}; 