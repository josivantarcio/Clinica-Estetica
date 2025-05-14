import { Router } from 'express';
import Servico from '../models/Servico';

const router = Router();

// Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
});

// Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviço.' });
  }
});

// Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const servico = await Servico.create(req.body);
    res.status(201).json(servico);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar serviço.' });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    await servico.update(req.body);
    res.json(servico);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar serviço.' });
  }
});

// Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    await servico.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar serviço.' });
  }
});

export default router; 