import UsuarioService from "../services/UsuarioService.js";

class UsuarioController {
  async list(req, res) {
    const { role } = req.query;
    const usuarios = await UsuarioService.list({ role });
    return res.status(200).json(usuarios);
  }

  async create(req, res) {
    const usuario = await UsuarioService.create(req.body);
    return res.status(201).json(usuario);
  }

  async getById(req, res) {
    const usuario = await UsuarioService.getById(req.params.id);
    return res.status(200).json(usuario);
  }

  async update(req, res) {
    const usuario = await UsuarioService.update(req.params.id, req.body);
    return res.status(200).json(usuario);
  }

  async delete(req, res) {
    await UsuarioService.delete(req.params.id);
    return res.status(204).send();
  }
}

export default new UsuarioController();
