import { Router } from "express";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import DisciplinaController from "../controllers/DisciplinaController.js";

const router = Router();

router.use(authenticateJWT);

router.get("/", asyncHandler((req, res) => DisciplinaController.list(req, res)));
router.get("/:id", asyncHandler((req, res) => DisciplinaController.getById(req, res)));

router.post("/", authorizeRoles("ADMIN", "PROFESSOR"), asyncHandler((req, res) => DisciplinaController.create(req, res)));
router.put("/:id", authorizeRoles("ADMIN", "PROFESSOR"), asyncHandler((req, res) => DisciplinaController.update(req, res)));
router.delete("/:id", authorizeRoles("ADMIN", "PROFESSOR"), asyncHandler((req, res) => DisciplinaController.delete(req, res)));

export default router;
