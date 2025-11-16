import DisciplinaService from "../services/DisciplinaService.js";
import { createAppError } from "../errors/AppError.js";

class DisciplinaController {
  async list(req, res) {
    const disciplinas = await DisciplinaService.listar();
    return res.status(200).json(disciplinas);
  }

  async getById(req, res) {
    const { id } = req.params;
    if (!id) throw createAppError("PARAMETRO_INVALIDO", { message: "ID da disciplina é obrigatório." });
    const disc = await DisciplinaService.buscarPorId(id);
    return res.status(200).json(disc);
  }

  async create(req, res) {
    const { nome, codigo } = req.body ?? {};
    if (!nome) throw createAppError("PARAMETRO_INVALIDO", { message: "Nome é obrigatório." });
    const nova = await DisciplinaService.criar({ nome, codigo });
    return res.status(201).json(nova);
  }

  async update(req, res) {
    const { id } = req.params;
    const { nome, codigo } = req.body ?? {};
    if (!id) throw createAppError("PARAMETRO_INVALIDO", { message: "ID é obrigatório." });
    const atualizada = await DisciplinaService.atualizar(id, { nome, codigo });
    return res.status(200).json(atualizada);
  }

  async delete(req, res) {
    const { id } = req.params;
    if (!id) throw createAppError("PARAMETRO_INVALIDO", { message: "ID é obrigatório." });
    await DisciplinaService.excluir(id);
    return res.status(204).send();
  }
}

export default new DisciplinaController();
