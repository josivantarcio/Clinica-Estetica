import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Servico extends Model {
  public id!: number;
  public nome!: string;
  public descricao?: string;
  public preco!: number;
  public duracao!: number; // duração em minutos
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Servico.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Servico',
    tableName: 'servicos',
  }
);

export default Servico; 