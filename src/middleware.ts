// Middleware simplificado para API
import express from 'express';

// Função para criar um middleware de autenticação
export function createAuthMiddleware() {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Lógica de autenticação básica
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    
    // Aqui você pode verificar o token com JWT ou outro método
    // Por enquanto apenas prossegue
    next();
  };
}

// Exporta outros middlewares conforme necessário
export const authMiddleware = createAuthMiddleware();
