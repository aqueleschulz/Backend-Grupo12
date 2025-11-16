import { Router } from "express";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import MatriculaAdminController from "../controllers/MatriculaAdminController.js";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("ADMIN"));

router.get('/', asyncHandler((req,res)=> MatriculaAdminController.list(req,res)));
router.post('/', asyncHandler((req,res)=> MatriculaAdminController.create(req,res)));
router.delete('/:id', asyncHandler((req,res)=> MatriculaAdminController.cancel(req,res)));

export default router;
