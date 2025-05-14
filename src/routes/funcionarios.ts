import { Router } from 'express';
import Funcionario from '../models/Funcionario';

const router = Router();

// Listar todos os funcionários
router.get('/', async (req, res) => {
  try {
    const funcionarios = await Funcionario.findAll();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários.' });
  }
});

// Buscar funcionário por ID
router.get('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionário.' });
  }
});

// Criar novo funcionário
router.post('/', async (req, res) => {
  try {
    const funcionario = await Funcionario.create(req.body);
    res.status(201).json(funcionario);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar funcionário.' });
  }
});

// Atualizar funcionário
router.put('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }
    await funcionario.update(req.body);
    res.json(funcionario);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar funcionário.' });
  }
});

// Deletar funcionário
router.delete('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }
    await funcionario.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar funcionário.' });
  }
});

export default router; 