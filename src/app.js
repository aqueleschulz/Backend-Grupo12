import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api', routes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(errorHandler);

export default app;
