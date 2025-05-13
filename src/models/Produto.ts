import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Produto extends Model {
  public id!: number;
  public nome!: string;
  public quantidade!: number;
  public unidade!: string;
  public categoria?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Produto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    unidade: { type: DataTypes.STRING, allowNull: false },
    categoria: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Produto',
    tableName: 'produtos',
  }
);

export default Produto; 