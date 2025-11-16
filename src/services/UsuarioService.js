import UsuarioRepository from "../repositories/UsuarioRepository.js";
import bcrypt from "bcryptjs";

class UsuarioService {
  async list() {
    return UsuarioRepository.findAll();
  }

  async create({ nome, email, senha, roles }) {
    const senha_hash = await bcrypt.hash(senha, 10);
    return UsuarioRepository.create({ nome, email, senha_hash, roles });
  }

  async getById(id) {
    return UsuarioRepository.findById(id);
  }

  async delete(id) {
    return UsuarioRepository.delete(id);
  }

  async update(id, data) {
    return UsuarioRepository.update(id, data);
  }
}

export default new UsuarioService();
