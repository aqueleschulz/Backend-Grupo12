import MatriculaService from "../services/MatriculaService.js";

class MatriculaAdminController {
  async list(req, res) {
    const matriculas = await MatriculaService.listAll();
    res.status(200).json(matriculas);
  }
}

export default new MatriculaAdminController();
