import { Router } from 'express';
import Agendamento from '../models/Agendamento';

const router = Router();

// Listar todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

// Buscar agendamento por ID
router.get('/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
});

// Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const agendamento = await Agendamento.create(req.body);
    res.status(201).json(agendamento);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar agendamento.' });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    await agendamento.update(req.body);
    res.json(agendamento);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }
    await agendamento.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
});

export default router; 