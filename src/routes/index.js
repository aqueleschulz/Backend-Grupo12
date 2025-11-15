import { Router } from 'express';
import matriculasRoutes from './matriculas.routes.js';
import authRoutes from './auth.routes.js';
import turmasRoutes from './turmas.routes.js';

const router = Router();

router.use('/matriculas', matriculasRoutes);
router.use('/auth', authRoutes);
router.use('/turmas', turmasRoutes);

export default router;