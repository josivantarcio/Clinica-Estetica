import sequelize from './database';
import Cliente from '../models/Cliente';

export async function initializeDatabase() {
  try {
    // Testa a conexão
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Sincroniza os modelos com o banco de dados
    // force: true irá recriar as tabelas (use apenas em desenvolvimento)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados com o banco de dados.');

  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
} 