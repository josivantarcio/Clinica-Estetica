import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Funcionario extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public telefone!: string;
  public cargo!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Funcionario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    telefone: { type: DataTypes.STRING, allowNull: false },
    cargo: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Funcionario',
    tableName: 'funcionarios',
  }
);

export default Funcionario; 