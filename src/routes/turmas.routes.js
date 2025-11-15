import { Router } from 'express';
import TurmaController from '../controllers/TurmaController.js';
import authenticateJWT from '../middlewares/authenticateJWT.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', asyncHandler((req, res) => TurmaController.list(req, res)));

router.get('/:id', asyncHandler((req, res) => TurmaController.getById(req, res)));

router.post('/', authorizeRoles('PROFESSOR', 'ADMIN'), asyncHandler((req, res) => TurmaController.create(req, res)));

router.put('/:id', authorizeRoles('PROFESSOR', 'ADMIN'), asyncHandler((req, res) => TurmaController.update(req, res)));

router.delete('/:id', authorizeRoles('PROFESSOR', 'ADMIN'), asyncHandler((req, res) => TurmaController.delete(req, res)));

export default router;

