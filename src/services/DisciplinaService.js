import { createAppError } from "../errors/AppError.js";
import DisciplinaRepository from "../repositories/DisciplinaRepository.js";

class DisciplinaService {
  async listar() {
    return await DisciplinaRepository.findAll();
  }

  async buscarPorId(id) {
    const disciplina = await DisciplinaRepository.findById(id);

    if (!disciplina) {
      throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    }

    return disciplina;
  }

  async criar({ nome }) {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase(); // código automático

    return await DisciplinaRepository.create({
      nome,
      codigo,
    });
  }

  async atualizar(id, { nome }) {
    const disciplina = await DisciplinaRepository.findById(id);

    if (!disciplina) {
      throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    }

    return await DisciplinaRepository.update(id, { nome });
  }

  async excluir(id) {
    const disciplina = await DisciplinaRepository.findById(id);

    if (!disciplina) {
      throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    }

    await DisciplinaRepository.delete(id);
  }
}

export default new DisciplinaService();
