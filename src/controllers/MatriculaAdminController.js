import MatriculaService from "../services/MatriculaService.js";
import { createAppError } from "../errors/AppError.js";

class MatriculaAdminController {
  async list(req, res) {
    const all = await MatriculaService.listAll();
    return res.status(200).json(all);
  }

  async create(req, res) {
    const { alunoId, turmaId } = req.body ?? {};
    if (!alunoId || !turmaId) throw createAppError("PARAMETRO_INVALIDO", { message: "alunoId e turmaId são obrigatórios." });
    const m = await MatriculaService.createAdmin({ alunoId, turmaId });
    return res.status(201).json(m);
  }

  async cancel(req, res) {
    const { id } = req.params;
    if (!id) throw createAppError("MATRICULA_NAO_ENCONTRADA");
    await MatriculaService.cancelAdmin(id);
    return res.status(204).send();
  }
}

export default new MatriculaAdminController();
