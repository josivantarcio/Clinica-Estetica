import { Router } from 'express';
import Recompensa from '../models/Recompensa';

const router = Router();

// Listar todas as recompensas
router.get('/', async (req, res) => {
  try {
    const recompensas = await Recompensa.findAll();
    res.json(recompensas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar recompensas.' });
  }
});

// Buscar recompensa por ID
router.get('/:id', async (req, res) => {
  try {
    const recompensa = await Recompensa.findByPk(req.params.id);
    if (!recompensa) {
      return res.status(404).json({ error: 'Recompensa não encontrada.' });
    }
    res.json(recompensa);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar recompensa.' });
  }
});

// Criar nova recompensa
router.post('/', async (req, res) => {
  try {
    const recompensa = await Recompensa.create(req.body);
    res.status(201).json(recompensa);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar recompensa.' });
  }
});

// Atualizar recompensa
router.put('/:id', async (req, res) => {
  try {
    const recompensa = await Recompensa.findByPk(req.params.id);
    if (!recompensa) {
      return res.status(404).json({ error: 'Recompensa não encontrada.' });
    }
    await recompensa.update(req.body);
    res.json(recompensa);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar recompensa.' });
  }
});

// Deletar recompensa
router.delete('/:id', async (req, res) => {
  try {
    const recompensa = await Recompensa.findByPk(req.params.id);
    if (!recompensa) {
      return res.status(404).json({ error: 'Recompensa não encontrada.' });
    }
    await recompensa.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar recompensa.' });
  }
});

export default router; 