import TurmaService from "../services/TurmaService.js";
import { createAppError } from "../errors/AppError.js";

class TurmaController {
  async create(req, res) {
    const { codigo, vagas, dia, turno, disciplinaId, professorId } = req.body ?? {};
    // converter vagas no controller para detectar erros rapidamente
    const vagasValue = vagas === "" || vagas === undefined || vagas === null ? null : Number(vagas);
    if (vagas !== null && vagas !== "" && Number.isNaN(vagasValue)) {
      return res.status(400).json({ error: "vagas deve ser um número ou vazio." });
    }
    const turma = await TurmaService.criar({ codigo, vagas: vagasValue, dia, turno, disciplinaId, professorId });
    return res.status(201).json(turma);
  }

  async update(req, res) {
    const { id } = req.params;
    const { codigo, vagas, dia, turno, disciplinaId, professorId } = req.body ?? {};
    const vagasValue = vagas === "" || vagas === undefined || vagas === null ? null : Number(vagas);
    if (vagas !== null && vagas !== "" && Number.isNaN(vagasValue)) {
      return res.status(400).json({ error: "vagas deve ser um número ou vazio." });
    }
    const turma = await TurmaService.atualizar(id, { codigo, vagas: vagasValue, dia, turno, disciplinaId, professorId });
    return res.status(200).json(turma);
  }

  async list(req, res) {
    const turmas = await TurmaService.listar();
    return res.status(200).json(turmas);
  }

  async getById(req, res) {
    const { id } = req.params;
    if (!id) throw createAppError("TURMA_INEXISTENTE");
    const turma = await TurmaService.buscarPorId(id);
    return res.status(200).json(turma);
  }

  async delete(req, res) {
    const { id } = req.params;
    await TurmaService.excluir(id);
    return res.status(204).send();
  }
}

export default new TurmaController();
