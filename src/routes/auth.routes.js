import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

// Definir a rota POST /auth/login
router.post('/login', asyncHandler(AuthController.handleLogin));

export default router;