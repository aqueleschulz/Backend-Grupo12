import { UsuarioRepository } from "../repositories/UsuarioRepository.js";

class UsuarioService {
  async list({ role }) {
    if (role) return UsuarioRepository.findByRole(role);
    return UsuarioRepository.findAll();
  }
}

export default new UsuarioService();
