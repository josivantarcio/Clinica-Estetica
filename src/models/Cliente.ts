import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Cliente extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public telefone!: string;
  public dataNascimento!: Date;
  public observacoes?: string;
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
  },
  {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
  }
);

export default Cliente; 