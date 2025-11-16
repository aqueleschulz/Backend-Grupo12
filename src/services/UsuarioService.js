import UsuarioRepository from "../repositories/UsuarioRepository.js";
import bcrypt from "bcryptjs";
import { createAppError } from "../errors/AppError.js";

class UsuarioService {
  async list({ role } = {}) {
    const usuarios = await UsuarioRepository.findAll();
    if (!role) return usuarios;
    return usuarios.filter(u => (u.roles || []).includes(role));
  }

  async create({ nome, email, senha, roles = [] }) {
    if (!nome || !email || !senha) {
      throw createAppError("PARAMETRO_INVALIDO", { message: "nome, email e senha são obrigatórios." });
    }
    const senha_hash = await bcrypt.hash(senha, 10);
    return UsuarioRepository.create({ nome, email, senha_hash, roles });
  }

  async getById(id) {
    return UsuarioRepository.findById(id);
  }

  async update(id, data) {
    return UsuarioRepository.update(id, data);
  }

  async delete(id) {
    return UsuarioRepository.delete(id);
  }
}

export default new UsuarioService();
