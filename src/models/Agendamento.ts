import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Cliente from './Cliente';
import Servico from './Servico';
import Funcionario from './Funcionario';

class Agendamento extends Model {
  public id!: number;
  public data!: Date;
  public status!: string;
  public clienteId!: number;
  public servicoId!: number;
  public funcionarioId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Agendamento.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    data: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pendente' },
    clienteId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' } },
    servicoId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'servicos', key: 'id' } },
    funcionarioId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'funcionarios', key: 'id' } },
  },
  {
    sequelize,
    modelName: 'Agendamento',
    tableName: 'agendamentos',
  }
);

Agendamento.belongsTo(Cliente, { foreignKey: 'clienteId' });
Agendamento.belongsTo(Servico, { foreignKey: 'servicoId' });
Agendamento.belongsTo(Funcionario, { foreignKey: 'funcionarioId' });

export default Agendamento; 