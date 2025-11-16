import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use('/api', routes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(errorHandler);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
