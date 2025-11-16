import { Router } from "express";
import matriculasRoutes from "./matriculas.routes.js";
import authRoutes from "./auth.routes.js";
import turmasRoutes from "./turmas.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import disciplinasRoutes from "./disciplinas.routes.js";
import adminMatriculasRoutes from "./admin.matriculas.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/turmas", turmasRoutes);
router.use("/matriculas", matriculasRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/disciplinas", disciplinasRoutes);
router.use("/admin/matriculas", adminMatriculasRoutes);

export default router;