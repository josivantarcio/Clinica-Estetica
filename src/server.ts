import app from './app';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Define a porta - usa a variável PORT do Render ou 3000 como fallback
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
