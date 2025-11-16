import TurmaRepository from "../repositories/TurmaRepository.js";
import { createAppError } from "../errors/AppError.js";

class TurmaService {
  async listar() {
    return TurmaRepository.findAll();
  }

  async buscarPorId(id) {
    const t = await TurmaRepository.findById(id);
    if (!t) throw createAppError("TURMA_INEXISTENTE");
    return t;
  }

  async criar({ codigo, vagas, dia, turno, disciplinaId, professorId }) {
    return TurmaRepository.create({ codigo, vagas, dia, turno, disciplinaId, professorId });
  }

  async atualizar(id, data) {
    const t = await TurmaRepository.findById(id);
    if (!t) throw createAppError("TURMA_INEXISTENTE");
    return TurmaRepository.update(id, data);
  }

  async excluir(id, usuarioId) {
    const t = await TurmaRepository.findById(id);
    if (!t) throw createAppError("TURMA_INEXISTENTE");
    // aqui você pode validar permissões adicionais se quiser (por exemplo só professor dono ou admin)
    await TurmaRepository.delete(id);
  }
}

export default new TurmaService();
