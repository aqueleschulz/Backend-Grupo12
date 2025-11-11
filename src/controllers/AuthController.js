import { AuthService } from '../services/AuthService.js';

async function handleLogin(req, res) {
  // Pegar os dados do corpo da requisição
  const { email, senha } = req.body;

  // Chamar o 'cérebro' (o Service)
  const tokenDTO = await AuthService.autenticar({ email, senha });

  // Devolver a resposta de sucesso (200) com o token
  return res.status(200).json(tokenDTO);
}

export const AuthController = {
  handleLogin,
};