import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class RecompensaFidelidade extends Model {
  public id!: number;
  public descricao!: string;
  public pontos!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecompensaFidelidade.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    descricao: { type: DataTypes.STRING, allowNull: false },
    pontos: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'RecompensaFidelidade',
    tableName: 'recompensas_fidelidade',
  }
);

export default RecompensaFidelidade; 