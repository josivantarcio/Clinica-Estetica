import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Cliente extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public telefone!: string;
  public dataNascimento!: Date;
  public observacoes?: string;
  public pontos!: number;
  public nivel!: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  public totalGasto!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cliente.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dataNascimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pontos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nivel: {
      type: DataTypes.ENUM('Bronze', 'Prata', 'Ouro', 'Diamante'),
      allowNull: false,
      defaultValue: 'Bronze',
    },
    totalGasto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
  }
);

export default Cliente; 