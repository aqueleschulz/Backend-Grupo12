import { Router } from 'express';
import matriculasRoutes from './matriculas.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/matriculas', matriculasRoutes);
router.use('/auth', authRoutes);

export default router;