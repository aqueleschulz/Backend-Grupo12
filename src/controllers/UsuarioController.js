import UsuarioService from "../services/UsuarioService.js";

class UsuarioController {
  async list(req, res) {
    const { role } = req.query;

    const usuarios = await UsuarioService.list({ role });
    return res.status(200).json(usuarios);
  }
}

export default new UsuarioController();
