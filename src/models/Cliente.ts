import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { encryptData, decryptData } from '../utils/encryption';

class Cliente extends Model {
  public id!: number;
  public nome!: string;
  public email!: string;
  public telefone!: string;
  public dataNascimento!: string;
  public observacoes?: string;
  public pontos!: number;
  public nivel!: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  public totalGasto!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cliente.beforeCreate((instance: Cliente) => {
  instance.nome = encryptData(instance.nome);
  instance.email = encryptData(instance.email);
  instance.telefone = encryptData(instance.telefone);
  instance.dataNascimento = encryptData(instance.dataNascimento);
});

Cliente.beforeUpdate((instance: Cliente) => {
  if (instance.changed('nome')) {
    instance.nome = encryptData(instance.nome);
  }
  if (instance.changed('email')) {
    instance.email = encryptData(instance.email);
  }
  if (instance.changed('telefone')) {
    instance.telefone = encryptData(instance.telefone);
  }
  if (instance.changed('dataNascimento')) {
    instance.dataNascimento = encryptData(instance.dataNascimento);
  }
});

Cliente.afterFind((instances: Cliente | readonly Cliente[] | null) => {
  if (!instances) return;
  if (Array.isArray(instances)) {
    (instances as Cliente[]).forEach((client) => {
      client.nome = decryptData(client.nome);
      client.email = decryptData(client.email);
      client.telefone = decryptData(client.telefone);
      client.dataNascimento = decryptData(client.dataNascimento);
    });
  } else {
    const client = instances as Cliente;
    client.nome = decryptData(client.nome);
    client.email = decryptData(client.email);
    client.telefone = decryptData(client.telefone);
    client.dataNascimento = decryptData(client.dataNascimento);
  }
});

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
