import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class CategoriaServico extends Model {
  public id!: number;
  public nome!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CategoriaServico.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: 'CategoriaServico',
    tableName: 'categorias_servico',
  }
);

export default CategoriaServico; 