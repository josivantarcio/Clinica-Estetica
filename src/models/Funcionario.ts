import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { encryptData, decryptData } from '../utils/encryption';

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

// Registrar hooks APÓS a inicialização do modelo
Funcionario.beforeCreate((instance: Funcionario) => {
  instance.nome = encryptData(instance.nome);
  instance.email = encryptData(instance.email);
  instance.telefone = encryptData(instance.telefone);
});

Funcionario.beforeUpdate((instance: Funcionario) => {
  if (instance.changed('nome')) {
    instance.nome = encryptData(instance.nome);
  }
  if (instance.changed('email')) {
    instance.email = encryptData(instance.email);
  }
  if (instance.changed('telefone')) {
    instance.telefone = encryptData(instance.telefone);
  }
});

Funcionario.afterFind((instances: Funcionario | Funcionario[] | null) => {
  if (!instances) return;
  if (Array.isArray(instances)) {
    instances.forEach((funcionario) => {
      funcionario.nome = decryptData(funcionario.nome);
      funcionario.email = decryptData(funcionario.email);
      funcionario.telefone = decryptData(funcionario.telefone);
    });
  } else {
    instances.nome = decryptData(instances.nome);
    instances.email = decryptData(instances.email);
    instances.telefone = decryptData(instances.telefone);
  }
});

export default Funcionario;
