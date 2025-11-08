import { Router } from 'express';
import MatriculaController from '../controllers/MatriculaController.js';
import authenticateJWT from '../middlewares/authenticateJWT.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import attachAlunoId from '../middlewares/attachAlunoId.js';
import asyncHandler from '../middlewares/asyncHandler.js';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('ALUNO'));
router.use(asyncHandler(attachAlunoId));

router.post('/', asyncHandler((req, res) => MatriculaController.create(req, res)));
router.get('/', asyncHandler((req, res) => MatriculaController.list(req, res)));
router.delete('/:id', asyncHandler((req, res) => MatriculaController.cancel(req, res)));

export default router;
