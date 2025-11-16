import MatriculaService from "../services/MatriculaService.js";
import { createAppError } from "../errors/AppError.js";

class MatriculaController {
  async create(req, res) {
    const { turmaId } = req.body ?? {};
    if (!turmaId) throw createAppError("PARAMETRO_INVALIDO", { message: "turmaId é obrigatório." });
    const matricula = await MatriculaService.enroll({ alunoId: req.alunoId, turmaId });
    return res.status(201).json(matricula);
  }

  async cancel(req, res) {
    const { id } = req.params;
    if (!id) throw createAppError("MATRICULA_NAO_ENCONTRADA");
    await MatriculaService.cancel({ alunoId: req.alunoId, matriculaId: id });
    return res.status(204).send();
  }

  async list(req, res) {
    const { me } = req.query;
    if (me !== "true") throw createAppError("PARAMETRO_INVALIDO", { message: "Apenas listagem pessoal (me=true) está disponível." });
    const matriculas = await MatriculaService.listByAluno(req.alunoId);
    return res.status(200).json(matriculas);
  }
}

export default new MatriculaController();
