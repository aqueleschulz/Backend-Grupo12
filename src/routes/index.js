import { Router } from 'express';
import matriculasRoutes from './matriculas.routes.js';

const router = Router();

router.use('/matriculas', matriculasRoutes);

export default router;
