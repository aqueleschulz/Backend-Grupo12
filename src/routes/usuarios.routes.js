import { Router } from "express";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import UsuarioController from "../controllers/UsuarioController.js";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("ADMIN"));


router.get('/', asyncHandler((req,res)=> UsuarioController.list(req,res)));
router.post('/', asyncHandler((req,res)=> UsuarioController.create(req,res)));
router.get('/:id', asyncHandler((req,res)=> UsuarioController.getById(req,res)));
router.put('/:id', asyncHandler((req,res)=> UsuarioController.update(req,res)));
router.delete('/:id', asyncHandler((req,res)=> UsuarioController.delete(req,res)));

export default router;
