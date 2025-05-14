import { Router } from 'express';
import Categoria from '../models/Categoria';

const router = Router();

// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
});

// Buscar categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categoria.' });
  }
});

// Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const categoria = await Categoria.create(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar categoria.' });
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    await categoria.update(req.body);
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar categoria.' });
  }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    await categoria.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar categoria.' });
  }
});

export default router; 