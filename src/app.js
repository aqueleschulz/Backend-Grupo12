import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));


app.use(express.json());
app.use('/api', routes);
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(errorHandler);

export default app;
