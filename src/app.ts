import express from 'express';
import clientesRouter from './routes/clientes';
import servicosRouter from './routes/servicos';
import funcionariosRouter from './routes/funcionarios';
import agendamentosRouter from './routes/agendamentos';
import produtosRouter from './routes/produtos';
import categoriasRouter from './routes/categorias';
import recompensasRouter from './routes/recompensas';

const app = express();

app.use(express.json());

// Rotas
app.use('/api/clientes', clientesRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/recompensas', recompensasRouter);

export default app; 