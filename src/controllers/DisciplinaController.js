import DisciplinaService from "../services/DisciplinaService.js";
import { createAppError } from "../errors/AppError.js";

class DisciplinaController {
  // GET /disciplinas
  async list(req, res) {
    const disciplinas = await DisciplinaService.listar();
    return res.status(200).json(disciplinas);
  }

  // GET /disciplinas/:id
  async getById(req, res) {
    const { id } = req.params;

    if (!id) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "ID da disciplina é obrigatório.",
      });
    }

    const disciplina = await DisciplinaService.buscarPorId(id);
    return res.status(200).json(disciplina);
  }

  // POST /disciplinas
  async create(req, res) {
    const { nome } = req.body ?? {};

    if (!nome) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "Nome da disciplina é obrigatório.",
      });
    }

    const novaDisciplina = await DisciplinaService.criar({ nome });
    return res.status(201).json(novaDisciplina);
  }

  // PUT /disciplinas/:id
  async update(req, res) {
    const { id } = req.params;
    const { nome } = req.body ?? {};

    if (!id) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "ID da disciplina é obrigatório.",
      });
    }

    if (!nome) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "Nome da disciplina é obrigatório.",
      });
    }

    const disciplinaAtualizada = await DisciplinaService.atualizar(id, { nome });
    return res.status(200).json(disciplinaAtualizada);
  }

  // DELETE /disciplinas/:id
  async delete(req, res) {
    const { id } = req.params;

    if (!id) {
      throw createAppError("PARAMETRO_INVALIDO", {
        message: "ID da disciplina é obrigatório.",
      });
    }

    await DisciplinaService.excluir(id);
    return res.status(204).send();
  }
}

export default new DisciplinaController();
