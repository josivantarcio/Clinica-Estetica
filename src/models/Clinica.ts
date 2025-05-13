import { Model, DataTypes, Sequelize } from 'sequelize';

export class Clinica extends Model {
  declare id: string;
  declare nome: string;
  declare documento: string;
  declare plano: 'basico' | 'premium';
  declare asaasCustomerId: string;
  declare status: 'active' | 'suspended' | 'canceled';
  declare dataVencimento: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Clinica {
    return this.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      documento: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      plano: {
        type: DataTypes.ENUM('basico', 'premium'),
        allowNull: false
      },
      asaasCustomerId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'canceled'),
        defaultValue: 'active'
      },
      dataVencimento: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Clinica',
      tableName: 'clinicas',
      timestamps: true
    });
  }
} 