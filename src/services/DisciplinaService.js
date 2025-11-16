import DisciplinaRepository from "../repositories/DisciplinaRepository.js";
import { createAppError } from "../errors/AppError.js";

class DisciplinaService {
  async listar() {
    return DisciplinaRepository.findAll();
  }

  async buscarPorId(id) {
    const disc = await DisciplinaRepository.findById(id);
    if (!disc) throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    return disc;
  }

  async criar({ nome, codigo }) {
    if (!nome) throw createAppError("PARAMETRO_INVALIDO", { message: "Nome é obrigatório" });
    const cod = codigo || Math.random().toString(36).substring(2, 8).toUpperCase();
    return DisciplinaRepository.create({ nome, codigo: cod });
  }

  async atualizar(id, { nome, codigo }) {
    const disc = await DisciplinaRepository.findById(id);
    if (!disc) throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    return DisciplinaRepository.update(id, { nome, codigo });
  }

  async excluir(id) {
    const disc = await DisciplinaRepository.findById(id);
    if (!disc) throw createAppError("DISCIPLINA_NAO_ENCONTRADA");
    await DisciplinaRepository.delete(id);
  }
}

export default new DisciplinaService();
